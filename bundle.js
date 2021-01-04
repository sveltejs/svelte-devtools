(function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function is_promise(value) {
        return value && typeof value === 'object' && typeof value.then === 'function';
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function stop_propagation(fn) {
        return function (event) {
            event.stopPropagation();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    function handle_promise(promise, info) {
        const token = info.token = {};
        function update(type, index, key, value) {
            if (info.token !== token)
                return;
            info.resolved = value;
            let child_ctx = info.ctx;
            if (key !== undefined) {
                child_ctx = child_ctx.slice();
                child_ctx[key] = value;
            }
            const block = type && (info.current = type)(child_ctx);
            let needs_flush = false;
            if (info.block) {
                if (info.blocks) {
                    info.blocks.forEach((block, i) => {
                        if (i !== index && block) {
                            group_outros();
                            transition_out(block, 1, 1, () => {
                                info.blocks[i] = null;
                            });
                            check_outros();
                        }
                    });
                }
                else {
                    info.block.d(1);
                }
                block.c();
                transition_in(block, 1);
                block.m(info.mount(), info.anchor);
                needs_flush = true;
            }
            info.block = block;
            if (info.blocks)
                info.blocks[index] = block;
            if (needs_flush) {
                flush();
            }
        }
        if (is_promise(promise)) {
            const current_component = get_current_component();
            promise.then(value => {
                set_current_component(current_component);
                update(info.then, 1, info.value, value);
                set_current_component(null);
            }, error => {
                set_current_component(current_component);
                update(info.catch, 2, info.error, error);
                set_current_component(null);
                if (!info.hasCatch) {
                    throw error;
                }
            });
            // if we previously had a then/catch block, destroy it
            if (info.current !== info.pending) {
                update(info.pending, 0);
                return true;
            }
        }
        else {
            if (info.current !== info.then) {
                update(info.then, 1, info.value, promise);
                return true;
            }
            info.resolved = promise;
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.31.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* test/src/BasicTree/Component.svelte generated by Svelte v3.31.0 */

    const file = "test/src/BasicTree/Component.svelte";

    function create_fragment(ctx) {
    	let div;
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text("A component with string, number, array, and object attributes. The value is\n  ");
    			t1 = text(/*value*/ ctx[0]);
    			add_location(div, file, 11, 0, 184);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*value*/ 1) set_data_dev(t1, /*value*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Component", slots, []);
    	let { string } = $$props;
    	let { number } = $$props;
    	let { array } = $$props;
    	let { object } = $$props;
    	let { boolean } = $$props;
    	let value = 0;
    	Promise.resolve().then(() => $$invalidate(0, value = 1), 0);
    	const writable_props = ["string", "number", "array", "object", "boolean"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Component> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("string" in $$props) $$invalidate(1, string = $$props.string);
    		if ("number" in $$props) $$invalidate(2, number = $$props.number);
    		if ("array" in $$props) $$invalidate(3, array = $$props.array);
    		if ("object" in $$props) $$invalidate(4, object = $$props.object);
    		if ("boolean" in $$props) $$invalidate(5, boolean = $$props.boolean);
    	};

    	$$self.$capture_state = () => ({
    		string,
    		number,
    		array,
    		object,
    		boolean,
    		value
    	});

    	$$self.$inject_state = $$props => {
    		if ("string" in $$props) $$invalidate(1, string = $$props.string);
    		if ("number" in $$props) $$invalidate(2, number = $$props.number);
    		if ("array" in $$props) $$invalidate(3, array = $$props.array);
    		if ("object" in $$props) $$invalidate(4, object = $$props.object);
    		if ("boolean" in $$props) $$invalidate(5, boolean = $$props.boolean);
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [value, string, number, array, object, boolean];
    }

    class Component extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance, create_fragment, safe_not_equal, {
    			string: 1,
    			number: 2,
    			array: 3,
    			object: 4,
    			boolean: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Component",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*string*/ ctx[1] === undefined && !("string" in props)) {
    			console.warn("<Component> was created without expected prop 'string'");
    		}

    		if (/*number*/ ctx[2] === undefined && !("number" in props)) {
    			console.warn("<Component> was created without expected prop 'number'");
    		}

    		if (/*array*/ ctx[3] === undefined && !("array" in props)) {
    			console.warn("<Component> was created without expected prop 'array'");
    		}

    		if (/*object*/ ctx[4] === undefined && !("object" in props)) {
    			console.warn("<Component> was created without expected prop 'object'");
    		}

    		if (/*boolean*/ ctx[5] === undefined && !("boolean" in props)) {
    			console.warn("<Component> was created without expected prop 'boolean'");
    		}
    	}

    	get string() {
    		throw new Error("<Component>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set string(value) {
    		throw new Error("<Component>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get number() {
    		throw new Error("<Component>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set number(value) {
    		throw new Error("<Component>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get array() {
    		throw new Error("<Component>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set array(value) {
    		throw new Error("<Component>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get object() {
    		throw new Error("<Component>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set object(value) {
    		throw new Error("<Component>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get boolean() {
    		throw new Error("<Component>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set boolean(value) {
    		throw new Error("<Component>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* test/src/BasicTree/BasicTree.svelte generated by Svelte v3.31.0 */
    const file$1 = "test/src/BasicTree/BasicTree.svelte";

    function create_fragment$1(ctx) {
    	let div;
    	let ol;
    	let li0;
    	let t1;
    	let li1;
    	let t3;
    	let li2;
    	let t5;
    	let component;
    	let t6;
    	let span;
    	let current;

    	component = new Component({
    			props: {
    				object: {
    					one: {},
    					two: "a",
    					three: [0, NaN],
    					four: null,
    					five: undefined
    				},
    				string: "value",
    				number: 0,
    				boolean: false,
    				array: []
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			ol = element("ol");
    			li0 = element("li");
    			li0.textContent = "Basic tree rendering";
    			t1 = space();
    			li1 = element("li");
    			li1.textContent = "Element attributes, component properties and state";
    			t3 = space();
    			li2 = element("li");
    			li2.textContent = "Text nodes / anchors";
    			t5 = space();
    			create_component(component.$$.fragment);
    			t6 = space();
    			span = element("span");
    			add_location(li0, file$1, 9, 4, 151);
    			add_location(li1, file$1, 10, 4, 185);
    			add_location(li2, file$1, 11, 4, 249);
    			add_location(ol, file$1, 8, 2, 142);
    			attr_dev(span, "title", /*title*/ ctx[0]);
    			add_location(span, file$1, 19, 2, 455);
    			add_location(div, file$1, 7, 0, 134);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, ol);
    			append_dev(ol, li0);
    			append_dev(ol, t1);
    			append_dev(ol, li1);
    			append_dev(ol, t3);
    			append_dev(ol, li2);
    			append_dev(div, t5);
    			mount_component(component, div, null);
    			append_dev(div, t6);
    			append_dev(div, span);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*title*/ 1) {
    				attr_dev(span, "title", /*title*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(component.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(component.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(component);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("BasicTree", slots, []);
    	let title = "one";
    	Promise.resolve().then(() => $$invalidate(0, title = "two"));
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<BasicTree> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Component, title });

    	$$self.$inject_state = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [title];
    }

    class BasicTree extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "BasicTree",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* test/src/Detach/DetachComponent.svelte generated by Svelte v3.31.0 */

    function create_fragment$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Element renders above both element and button");
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("DetachComponent", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<DetachComponent> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class DetachComponent extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DetachComponent",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* test/src/Detach/Detach.svelte generated by Svelte v3.31.0 */
    const file$2 = "test/src/Detach/Detach.svelte";

    // (14:2) {#if isShown}
    function create_if_block(ctx) {
    	let detachcomponent;
    	let t0;
    	let div;
    	let current;
    	detachcomponent = new DetachComponent({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(detachcomponent.$$.fragment);
    			t0 = space();
    			div = element("div");
    			div.textContent = "Element renders below component and above button";
    			add_location(div, file$2, 15, 4, 306);
    		},
    		m: function mount(target, anchor) {
    			mount_component(detachcomponent, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(detachcomponent.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(detachcomponent.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(detachcomponent, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(14:2) {#if isShown}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div;
    	let p;
    	let t1;
    	let ol;
    	let li0;
    	let t3;
    	let li1;
    	let t5;
    	let t6;
    	let button;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*isShown*/ ctx[0] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			p.textContent = "Component / element nodes are";
    			t1 = space();
    			ol = element("ol");
    			li0 = element("li");
    			li0.textContent = "positioned correctly when mounted after first render";
    			t3 = space();
    			li1 = element("li");
    			li1.textContent = "removed when detached";
    			t5 = space();
    			if (if_block) if_block.c();
    			t6 = space();
    			button = element("button");
    			button.textContent = "Toggle";
    			add_location(p, file$2, 7, 2, 108);
    			add_location(li0, file$2, 9, 4, 156);
    			add_location(li1, file$2, 10, 4, 222);
    			add_location(ol, file$2, 8, 2, 147);
    			add_location(button, file$2, 18, 2, 377);
    			add_location(div, file$2, 6, 0, 100);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p);
    			append_dev(div, t1);
    			append_dev(div, ol);
    			append_dev(ol, li0);
    			append_dev(ol, t3);
    			append_dev(ol, li1);
    			append_dev(div, t5);
    			if (if_block) if_block.m(div, null);
    			append_dev(div, t6);
    			append_dev(div, button);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*isShown*/ ctx[0]) {
    				if (if_block) {
    					if (dirty & /*isShown*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, t6);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Detach", slots, []);
    	let isShown = false;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Detach> was created with unknown prop '${key}'`);
    	});

    	const click_handler = e => $$invalidate(0, isShown = !isShown);
    	$$self.$capture_state = () => ({ DetachComponent, isShown });

    	$$self.$inject_state = $$props => {
    		if ("isShown" in $$props) $$invalidate(0, isShown = $$props.isShown);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [isShown, click_handler];
    }

    class Detach extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Detach",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* test/src/Blocks.svelte generated by Svelte v3.31.0 */

    const file$3 = "test/src/Blocks.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[0] = list[i];
    	return child_ctx;
    }

    // (18:2) {#each valueList as value}
    function create_each_block(ctx) {
    	let span;
    	let t_value = /*value*/ ctx[0] + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			add_location(span, file$3, 17, 28, 354);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(18:2) {#each valueList as value}",
    		ctx
    	});

    	return block;
    }

    // (23:39) {:else}
    function create_else_block(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Value is under 5");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(23:39) {:else}",
    		ctx
    	});

    	return block;
    }

    // (23:24) 
    function create_if_block_1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Value is over 5");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(23:24) ",
    		ctx
    	});

    	return block;
    }

    // (21:4) {#if value > 10}
    function create_if_block$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Value is over 10");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(21:4) {#if value > 10}",
    		ctx
    	});

    	return block;
    }

    // (32:4) {:catch error}
    function create_catch_block_3(ctx) {
    	let t0;
    	let t1_value = /*error*/ ctx[3].message + "";
    	let t1;

    	const block = {
    		c: function create() {
    			t0 = text("Something went wrong\n      ");
    			t1 = text(t1_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block_3.name,
    		type: "catch",
    		source: "(32:4) {:catch error}",
    		ctx
    	});

    	return block;
    }

    // (29:4) {:then value}
    function create_then_block_3(ctx) {
    	let t0;
    	let t1_value = /*value*/ ctx[0] + "";
    	let t1;

    	const block = {
    		c: function create() {
    			t0 = text("Promise resolved to\n      ");
    			t1 = text(t1_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block_3.name,
    		type: "then",
    		source: "(29:4) {:then value}",
    		ctx
    	});

    	return block;
    }

    // (27:20)        waiting for the promise to resolve...     {:then value}
    function create_pending_block_3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("waiting for the promise to resolve...");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block_3.name,
    		type: "pending",
    		source: "(27:20)        waiting for the promise to resolve...     {:then value}",
    		ctx
    	});

    	return block;
    }

    // (43:4) {:catch error}
    function create_catch_block_2(ctx) {
    	let t0;
    	let t1_value = /*error*/ ctx[3].message + "";
    	let t1;

    	const block = {
    		c: function create() {
    			t0 = text("Something went wrong\n      ");
    			t1 = text(t1_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block_2.name,
    		type: "catch",
    		source: "(43:4) {:catch error}",
    		ctx
    	});

    	return block;
    }

    // (40:4) {:then value}
    function create_then_block_2(ctx) {
    	let t0;
    	let t1_value = /*value*/ ctx[0] + "";
    	let t1;

    	const block = {
    		c: function create() {
    			t0 = text("Something went wrong\n      ");
    			t1 = text(t1_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block_2.name,
    		type: "then",
    		source: "(40:4) {:then value}",
    		ctx
    	});

    	return block;
    }

    // (38:34)        Pending forever     {:then value}
    function create_pending_block_2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Pending forever");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block_2.name,
    		type: "pending",
    		source: "(38:34)        Pending forever     {:then value}",
    		ctx
    	});

    	return block;
    }

    // (55:4) {:catch error}
    function create_catch_block_1(ctx) {
    	let t0;
    	let t1_value = /*error*/ ctx[3].message + "";
    	let t1;

    	const block = {
    		c: function create() {
    			t0 = text("Something went wrong\n      ");
    			t1 = text(t1_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block_1.name,
    		type: "catch",
    		source: "(55:4) {:catch error}",
    		ctx
    	});

    	return block;
    }

    // (52:4) {:then value}
    function create_then_block_1(ctx) {
    	let t0;
    	let t1_value = /*value*/ ctx[0] + "";
    	let t1;

    	const block = {
    		c: function create() {
    			t0 = text("Promise resolved to\n      ");
    			t1 = text(t1_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block_1.name,
    		type: "then",
    		source: "(52:4) {:then value}",
    		ctx
    	});

    	return block;
    }

    // (50:31)        Something went wrong     {:then value}
    function create_pending_block_1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Something went wrong");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block_1.name,
    		type: "pending",
    		source: "(50:31)        Something went wrong     {:then value}",
    		ctx
    	});

    	return block;
    }

    // (66:4) {:catch error}
    function create_catch_block(ctx) {
    	let t0;
    	let t1_value = /*error*/ ctx[3] + "";
    	let t1;

    	const block = {
    		c: function create() {
    			t0 = text("Should reject\n      ");
    			t1 = text(t1_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block.name,
    		type: "catch",
    		source: "(66:4) {:catch error}",
    		ctx
    	});

    	return block;
    }

    // (63:4) {:then value}
    function create_then_block(ctx) {
    	let t0;
    	let t1_value = /*value*/ ctx[0] + "";
    	let t1;

    	const block = {
    		c: function create() {
    			t0 = text("Something went wrong\n      ");
    			t1 = text(t1_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block.name,
    		type: "then",
    		source: "(63:4) {:then value}",
    		ctx
    	});

    	return block;
    }

    // (61:39)        Something went wrong     {:then value}
    function create_pending_block(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Something went wrong");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block.name,
    		type: "pending",
    		source: "(61:39)        Something went wrong     {:then value}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div5;
    	let p;
    	let t1;
    	let t2;
    	let div0;
    	let t3;
    	let div1;
    	let promise_1;
    	let t4;
    	let div2;
    	let promise_2;
    	let t5;
    	let div3;
    	let promise_3;
    	let t6;
    	let div4;
    	let promise_4;
    	let each_value = /*valueList*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	function select_block_type(ctx, dirty) {
    		if (/*value*/ ctx[0] > 10) return create_if_block$1;
    		if (/*value*/ ctx[0] > 5) return create_if_block_1;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: true,
    		pending: create_pending_block_3,
    		then: create_then_block_3,
    		catch: create_catch_block_3,
    		value: 0,
    		error: 3
    	};

    	handle_promise(promise_1 = /*promise*/ ctx[2], info);

    	let info_1 = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: true,
    		pending: create_pending_block_2,
    		then: create_then_block_2,
    		catch: create_catch_block_2,
    		value: 0,
    		error: 3
    	};

    	handle_promise(promise_2 = new Promise(func), info_1);

    	let info_2 = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: true,
    		pending: create_pending_block_1,
    		then: create_then_block_1,
    		catch: create_catch_block_1,
    		value: 0,
    		error: 3
    	};

    	handle_promise(promise_3 = Promise.resolve(5), info_2);

    	let info_3 = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: true,
    		pending: create_pending_block,
    		then: create_then_block,
    		catch: create_catch_block,
    		value: 0,
    		error: 3
    	};

    	handle_promise(promise_4 = Promise.reject("rejected"), info_3);

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			p = element("p");
    			p.textContent = "Renders {#each} and {#if} blocks with original\n    source line";
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			div0 = element("div");
    			if_block.c();
    			t3 = space();
    			div1 = element("div");
    			info.block.c();
    			t4 = space();
    			div2 = element("div");
    			info_1.block.c();
    			t5 = space();
    			div3 = element("div");
    			info_2.block.c();
    			t6 = space();
    			div4 = element("div");
    			info_3.block.c();
    			add_location(p, file$3, 12, 2, 219);
    			add_location(div0, file$3, 19, 2, 385);
    			add_location(div1, file$3, 25, 2, 515);
    			add_location(div2, file$3, 36, 2, 736);
    			add_location(div3, file$3, 48, 2, 951);
    			add_location(div4, file$3, 59, 2, 1166);
    			add_location(div5, file$3, 11, 0, 211);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, p);
    			append_dev(div5, t1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div5, null);
    			}

    			append_dev(div5, t2);
    			append_dev(div5, div0);
    			if_block.m(div0, null);
    			append_dev(div5, t3);
    			append_dev(div5, div1);
    			info.block.m(div1, info.anchor = null);
    			info.mount = () => div1;
    			info.anchor = null;
    			append_dev(div5, t4);
    			append_dev(div5, div2);
    			info_1.block.m(div2, info_1.anchor = null);
    			info_1.mount = () => div2;
    			info_1.anchor = null;
    			append_dev(div5, t5);
    			append_dev(div5, div3);
    			info_2.block.m(div3, info_2.anchor = null);
    			info_2.mount = () => div3;
    			info_2.anchor = null;
    			append_dev(div5, t6);
    			append_dev(div5, div4);
    			info_3.block.m(div4, info_3.anchor = null);
    			info_3.mount = () => div4;
    			info_3.anchor = null;
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			if (dirty & /*valueList*/ 2) {
    				each_value = /*valueList*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div5, t2);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div0, null);
    				}
    			}

    			{
    				const child_ctx = ctx.slice();
    				child_ctx[0] = child_ctx[3] = info.resolved;
    				info.block.p(child_ctx, dirty);
    			}

    			{
    				const child_ctx = ctx.slice();
    				child_ctx[0] = child_ctx[3] = info_1.resolved;
    				info_1.block.p(child_ctx, dirty);
    			}

    			{
    				const child_ctx = ctx.slice();
    				child_ctx[0] = child_ctx[3] = info_2.resolved;
    				info_2.block.p(child_ctx, dirty);
    			}

    			{
    				const child_ctx = ctx.slice();
    				child_ctx[0] = child_ctx[3] = info_3.resolved;
    				info_3.block.p(child_ctx, dirty);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    			destroy_each(each_blocks, detaching);
    			if_block.d();
    			info.block.d();
    			info.token = null;
    			info = null;
    			info_1.block.d();
    			info_1.token = null;
    			info_1 = null;
    			info_2.block.d();
    			info_2.token = null;
    			info_2 = null;
    			info_3.block.d();
    			info_3.token = null;
    			info_3 = null;
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const func = () => {
    	
    };

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Blocks", slots, []);
    	let valueList = ["a", "b", "c"];
    	let value = 0;
    	Promise.resolve().then(() => $$invalidate(0, value = 1), 0);
    	let promise = new Promise((resolve, reject) => setTimeout(() => resolve(5), 2000));
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Blocks> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ valueList, value, promise });

    	$$self.$inject_state = $$props => {
    		if ("valueList" in $$props) $$invalidate(1, valueList = $$props.valueList);
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("promise" in $$props) $$invalidate(2, promise = $$props.promise);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [value, valueList, promise];
    }

    class Blocks extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Blocks",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* test/src/Bind/BindComponent.svelte generated by Svelte v3.31.0 */

    function create_fragment$5(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("BindComponent", slots, []);
    	let { value = Date.now() } = $$props;
    	const writable_props = ["value"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<BindComponent> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    	};

    	$$self.$capture_state = () => ({ value });

    	$$self.$inject_state = $$props => {
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [value];
    }

    class BindComponent extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { value: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "BindComponent",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get value() {
    		throw new Error("<BindComponent>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<BindComponent>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* test/src/Bind/Bind.svelte generated by Svelte v3.31.0 */

    const { console: console_1 } = globals;
    const file$4 = "test/src/Bind/Bind.svelte";

    function create_fragment$6(ctx) {
    	let div;
    	let p;
    	let t1;
    	let bindcomponent;
    	let updating_value;
    	let t2;
    	let input;
    	let current;
    	let mounted;
    	let dispose;

    	function bindcomponent_value_binding(value) {
    		/*bindcomponent_value_binding*/ ctx[1].call(null, value);
    	}

    	let bindcomponent_props = {};

    	if (/*value*/ ctx[0] !== void 0) {
    		bindcomponent_props.value = /*value*/ ctx[0];
    	}

    	bindcomponent = new BindComponent({
    			props: bindcomponent_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(bindcomponent, "value", bindcomponent_value_binding));

    	const block = {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			p.textContent = "Prepend 'bind' for bound Component binding. Note: element binds are simple\n    implicit event handlers";
    			t1 = space();
    			create_component(bindcomponent.$$.fragment);
    			t2 = space();
    			input = element("input");
    			add_location(p, file$4, 7, 2, 94);
    			add_location(input, file$4, 12, 2, 245);
    			add_location(div, file$4, 6, 0, 86);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p);
    			append_dev(div, t1);
    			mount_component(bindcomponent, div, null);
    			append_dev(div, t2);
    			append_dev(div, input);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(input, "change", /*change_handler*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const bindcomponent_changes = {};

    			if (!updating_value && dirty & /*value*/ 1) {
    				updating_value = true;
    				bindcomponent_changes.value = /*value*/ ctx[0];
    				add_flush_callback(() => updating_value = false);
    			}

    			bindcomponent.$set(bindcomponent_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(bindcomponent.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(bindcomponent.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(bindcomponent);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Bind", slots, []);
    	let value;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Bind> was created with unknown prop '${key}'`);
    	});

    	function bindcomponent_value_binding(value$1) {
    		value = value$1;
    		$$invalidate(0, value);
    	}

    	const change_handler = e => console.log(e);
    	$$self.$capture_state = () => ({ BindComponent, value });

    	$$self.$inject_state = $$props => {
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [value, bindcomponent_value_binding, change_handler];
    }

    class Bind extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Bind",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* test/src/Events/EventsComponent.svelte generated by Svelte v3.31.0 */
    const file$5 = "test/src/Events/EventsComponent.svelte";

    function create_fragment$7(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Click me!";
    			attr_dev(button, "type", "button");
    			add_location(button, file$5, 7, 0, 173);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", stop_propagation(prevent_default(/*handler*/ ctx[0])), { once: true }, true, true);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("EventsComponent", slots, []);
    	const dispatch = createEventDispatcher();
    	const handler = () => dispatch("click", "I was clicked!");
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<EventsComponent> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ createEventDispatcher, dispatch, handler });
    	return [handler];
    }

    class EventsComponent extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "EventsComponent",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* test/src/Events/Events.svelte generated by Svelte v3.31.0 */

    const { console: console_1$1 } = globals;
    const file$6 = "test/src/Events/Events.svelte";

    function create_fragment$8(ctx) {
    	let div;
    	let p;
    	let t1;
    	let eventscomponent;
    	let current;
    	let mounted;
    	let dispose;
    	eventscomponent = new EventsComponent({ $$inline: true });
    	eventscomponent.$on("click", /*click_handler*/ ctx[0]);

    	const block = {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			p.textContent = "Render event listeners on elements and components.";
    			t1 = space();
    			create_component(eventscomponent.$$.fragment);
    			add_location(p, file$6, 5, 2, 145);
    			add_location(div, file$6, 4, 0, 77);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p);
    			append_dev(div, t1);
    			mount_component(eventscomponent, div, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "keypress", /*keypress_handler*/ ctx[1], true, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(eventscomponent.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(eventscomponent.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(eventscomponent);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Events", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<Events> was created with unknown prop '${key}'`);
    	});

    	const click_handler = e => console.log(e.detail);
    	const keypress_handler = e => console.log("Captured a key", e);
    	$$self.$capture_state = () => ({ EventsComponent });
    	return [click_handler, keypress_handler];
    }

    class Events extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Events",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* test/src/Slots/SlotComponent.svelte generated by Svelte v3.31.0 */

    function create_fragment$9(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[0], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("SlotComponent", slots, ['default']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SlotComponent> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	return [$$scope, slots];
    }

    class SlotComponent extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SlotComponent",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* test/src/Slots/Slots.svelte generated by Svelte v3.31.0 */
    const file$7 = "test/src/Slots/Slots.svelte";

    // (7:2) <SlotComponent>
    function create_default_slot(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "Slot content";
    			add_location(span, file$7, 6, 17, 119);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(7:2) <SlotComponent>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let div;
    	let p;
    	let t1;
    	let slotcomponent;
    	let current;

    	slotcomponent = new SlotComponent({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			p.textContent = "Render slots.";
    			t1 = space();
    			create_component(slotcomponent.$$.fragment);
    			add_location(p, file$7, 5, 2, 81);
    			add_location(div, file$7, 4, 0, 73);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p);
    			append_dev(div, t1);
    			mount_component(slotcomponent, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const slotcomponent_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				slotcomponent_changes.$$scope = { dirty, ctx };
    			}

    			slotcomponent.$set(slotcomponent_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(slotcomponent.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(slotcomponent.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(slotcomponent);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Slots", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Slots> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ SlotComponent });
    	return [];
    }

    class Slots extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Slots",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* test/src/App.svelte generated by Svelte v3.31.0 */
    const file$8 = "test/src/App.svelte";

    function create_fragment$b(ctx) {
    	let div;
    	let basictree;
    	let t0;
    	let detach_1;
    	let t1;
    	let blocks;
    	let t2;
    	let bind_1;
    	let t3;
    	let events;
    	let t4;
    	let slots;
    	let current;
    	basictree = new BasicTree({ $$inline: true });
    	detach_1 = new Detach({ $$inline: true });
    	blocks = new Blocks({ $$inline: true });
    	bind_1 = new Bind({ $$inline: true });
    	events = new Events({ $$inline: true });
    	slots = new Slots({ $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(basictree.$$.fragment);
    			t0 = space();
    			create_component(detach_1.$$.fragment);
    			t1 = space();
    			create_component(blocks.$$.fragment);
    			t2 = space();
    			create_component(bind_1.$$.fragment);
    			t3 = space();
    			create_component(events.$$.fragment);
    			t4 = space();
    			create_component(slots.$$.fragment);
    			attr_dev(div, "class", "svelte-aep82n");
    			add_location(div, file$8, 34, 0, 872);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(basictree, div, null);
    			append_dev(div, t0);
    			mount_component(detach_1, div, null);
    			append_dev(div, t1);
    			mount_component(blocks, div, null);
    			append_dev(div, t2);
    			mount_component(bind_1, div, null);
    			append_dev(div, t3);
    			mount_component(events, div, null);
    			append_dev(div, t4);
    			mount_component(slots, div, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(basictree.$$.fragment, local);
    			transition_in(detach_1.$$.fragment, local);
    			transition_in(blocks.$$.fragment, local);
    			transition_in(bind_1.$$.fragment, local);
    			transition_in(events.$$.fragment, local);
    			transition_in(slots.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(basictree.$$.fragment, local);
    			transition_out(detach_1.$$.fragment, local);
    			transition_out(blocks.$$.fragment, local);
    			transition_out(bind_1.$$.fragment, local);
    			transition_out(events.$$.fragment, local);
    			transition_out(slots.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(basictree);
    			destroy_component(detach_1);
    			destroy_component(blocks);
    			destroy_component(bind_1);
    			destroy_component(events);
    			destroy_component(slots);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		BasicTree,
    		Detach,
    		Blocks,
    		Bind,
    		Events,
    		Slots
    	});

    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    new App({ target: document.body });

}());
