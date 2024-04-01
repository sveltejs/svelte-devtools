import { highlight } from './highlight.js';
import { addListener } from './listener.js';
// import { profiler } from './profiler.js';
import { nodes } from './svelte.js';

const propClones = new Map();

// @ts-ignore - for the app to call with `eval`
window['#SvelteDevTools'] = {
	/**
	 * @param {string} id
	 * @param {string} key
	 * @param {any} value
	 */
	inject(id, key, value) {
		const { detail: component } = nodes.map.get(id) || {};

		if (component) {
			const clone = updateProp(propClones.get(id)[key], value);

			component.$inject_state({
				[key]: clone,
			});
		}
	},
};

/**
 * @param {*} orig
 * @param {*} value
 * @returns {any}
 */
function updateProp(orig, value, seen = new Map()) {
	switch (typeof value) {
		case 'object': {
			if (value === window || value === null) return null;
			if (Array.isArray(value)) return value.map((o, index) => updateProp(orig[index], o, seen));
			if (seen.has(value)) return seen.get(value);

			/** @type {Record<string, any>} */
			const o = {};
			seen.set(value, o);
			for (const [key, v] of Object.entries(value)) {
				orig[key] = updateProp(orig[key], v, seen);
			}

			return orig;
		}
		default:
			return value;
	}
}

const previous = {
	/** @type {HTMLElement | null} */
	target: null,
	style: {
		cursor: '',
		background: '',
		outline: '',
	},

	clear() {
		if (this.target) {
			this.target.style.cursor = this.style.cursor;
			this.target.style.background = this.style.background;
			this.target.style.outline = this.style.outline;
		}
		this.target = null;
	},
};

const inspect = {
	/** @param {MouseEvent} event  */
	handle({ target }) {
		const same = previous.target && previous.target === target;
		const html = target instanceof HTMLElement;
		if (same || !html) return;

		if (previous.target) previous.clear();
		previous.target = target;
		previous.style = {
			cursor: target.style.cursor,
			background: target.style.background,
			outline: target.style.outline,
		};
		target.style.cursor = 'pointer';
		target.style.background = 'rgba(0, 136, 204, 0.2)';
		target.style.outline = '1px dashed rgb(0, 136, 204)';
	},
	/** @param {MouseEvent} event  */
	click(event) {
		event.preventDefault();
		document.removeEventListener('mousemove', inspect.handle, true);
		const node = nodes.map.get(/** @type {Node} */ (event.target));
		if (node) send('bridge::ext/inspect', { node: serialize(node) });
		previous.clear();
	},
};

window.addEventListener('message', ({ data, source }) => {
	// only accept messages from our application or script
	if (source !== window || data?.source !== 'svelte-devtools') return;

	if (data.type === 'bridge::ext/select') {
		const node = nodes.map.get(data.payload);
		// @ts-expect-error - saved for `devtools.inspect()`
		if (node) window.$n = node.detail;
	} else if (data.type === 'bridge::ext/highlight') {
		const node = nodes.map.get(data.payload);
		return highlight(node);
	} else if (data.type === 'bridge::ext/inspect') {
		switch (data.payload) {
			case 'start': {
				document.addEventListener('mousemove', inspect.handle, true);
				document.addEventListener('click', inspect.click, {
					capture: true,
					once: true,
				});
				break;
			}
			default: {
				document.removeEventListener('mousemove', inspect.handle, true);
				document.removeEventListener('click', inspect.click, true);
				previous.clear();
			}
		}
	}
});

/**
 * @param {unknown} value
 * @returns {any}
 */
function clone(value, seen = new Map()) {
	switch (typeof value) {
		case 'function':
			return { __is: 'function', source: value.toString(), name: value.name };
		case 'symbol':
			return { __is: 'symbol', name: value.toString() };
		case 'object': {
			if (value === window || value === null) return null;
			if (Array.isArray(value)) return value.map((o) => clone(o, seen));
			if (seen.has(value)) return {};

			/** @type {Record<string, any>} */
			const o = {};
			seen.set(value, o);
			for (const [key, v] of Object.entries(value)) {
				o[key] = clone(v, seen);
			}
			return o;
		}
		default:
			return value;
	}
}

/** @param {SvelteBlockDetail} node  */
function serialize(node) {
	const res = /** @type {SvelteBlockDetail} */ ({
		id: node.id,
		type: node.type,
		tagName: node.tagName,
		detail: {},
	});
	switch (node.type) {
		case 'component': {
			const { $$: internal = {} } = node.detail;
			const nodeState = node.detail.$capture_state?.() || {};
			const bindings = Object.values(internal.bound || {}).map(
				/** @param {Function} f */ (f) => f.name,
			);

			/** @type {Record<string, any>} */
			// clone original prop objects for update
			const _propClones = {};
			const props = Object.keys(internal.props || {}).flatMap((key) => {
				const prop = nodeState[key];

				if (prop) {
					const prototypeDescriptors = Object.getOwnPropertyDescriptors(
						Object.getPrototypeOf(nodeState[key]),
					);
					const protoClone = Object.create(null, prototypeDescriptors);
					const clone = Object.create(protoClone, Object.getOwnPropertyDescriptors(prop));
					_propClones[key] = clone;
				}

				const value = clone(prop);
				delete nodeState[key]; // deduplicate for ctx
				if (value === undefined) return [];

				const bounded = bindings.some((f) => f.includes(key));
				return { key, value, bounded };
			});

			propClones.set(res.id, _propClones);

			const ctx = clone(nodeState);

			res.detail = {
				attributes: props,
				listeners: Object.entries(internal.callbacks || {}).flatMap(([event, value]) =>
					value.map(/** @param {Function} f */ (f) => ({ event, handler: f.toString() })),
				),
				ctx: Object.entries(ctx).map(([key, value]) => ({ key, value })),
			};
			break;
		}

		case 'element': {
			/** @type {Attr[]} from {NamedNodeMap} */
			const attributes = Array.from(node.detail.attributes || []);

			/** @type {NonNullable<SvelteListenerDetail['node']['__listeners']>} */
			const listeners = node.detail.__listeners || [];

			res.detail = {
				attributes: attributes.map(({ name: key, value }) => ({ key, value })),
				listeners: listeners.map((o) => ({ ...o, handler: o.handler.toString() })),
			};
			break;
		}

		case 'text': {
			res.detail = {
				nodeValue: node.detail.nodeValue,
			};
			break;
		}

		case 'iteration':
		case 'block': {
			const { ctx, source } = node.detail;
			const cloned = Object.entries(clone(ctx));
			res.detail = {
				ctx: cloned.map(([key, value]) => ({ key, value })),
				source: source.slice(source.indexOf('{'), source.indexOf('}') + 1),
			};
			break;
		}
	}

	return res;
}

/**
 * @param {string} type
 * @param {Record<string, any>} [payload]
 */
function send(type, payload) {
	window.postMessage({ source: 'svelte-devtools', type, payload });
}

addListener({
	add(node, anchor) {
		send('bridge::courier/node->add', {
			node: serialize(node),
			target: node.parent?.id,
			anchor: anchor?.id,
		});
	},

	remove(node) {
		send('bridge::courier/node->remove', { node: serialize(node) });
	},

	update(node) {
		send('bridge::courier/node->update', { node: serialize(node) });
	},

	profile(/** frame */) {
		// send('bridge::courier/profile->update', { frame });
	},
});
