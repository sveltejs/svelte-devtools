import { highlight } from './highlight.js';
import { addListener } from './listener.js';
// import { profiler } from './profiler.js';
import { getNode } from './svelte.js';

// @ts-expect-error - possibly find an alternative
window.__svelte_devtools_inject_state = function (id, key, value) {
	const { detail: component } = getNode(id) || {};
	component && component.$inject_state({ [key]: value });
};

// @ts-expect-error - possibly find an alternative
window.__svelte_devtools_select_element = function (element) {
	const node = getNode(element);
	if (node) send('inspect', { node: serialize(node) });
};

window.addEventListener('message', ({ data, source }) => {
	// only accept messages from our application or script
	if (source !== window || data?.source !== 'svelte-devtools') return;

	if (data.type === 'ext/select') {
		const node = getNode(data.payload);
		// @ts-expect-error - saved for `inspect()`
		if (node) window.$s = node.detail;
	} else if (data.type === 'ext/highlight') {
		const node = getNode(data.payload);
		return highlight(node);
	}

	// case 'ext/inspect': {
	// 	console.log(data.payload, data.payload instanceof HTMLElement);
	// 	/** @param {MouseEvent} event  */
	// 	const move = ({ target }) => highlight({ type: 'element', detail: target });
	// 	if (data.payload instanceof HTMLElement) {
	// 		const node = getNode(data.payload);
	// 		if (node) window.postMessage({ type: 'inspect', node: serialize(node) });
	// 	} else if (data.payload === 'start') {
	// 		document.addEventListener('mousemove', move, true);
	// 		document.addEventListener(
	// 			'click',
	// 			({ target }) => {
	// 				document.removeEventListener('mousemove', move, true);
	// 				const node = getNode(/** @type {Node} */ (target));
	// 				if (node) window.postMessage({ type: 'inspect', node: serialize(node) });
	// 			},
	// 			{ capture: true, once: true },
	// 		);
	// 		return;
	// 	}
	// 	document.removeEventListener('mousemove', move, true);
	// 	return highlight(undefined);
	// }

	// case 'ext/profiler': {
	// 	return data.payload ? startProfiler() : stopProfiler();
	// }

	// switch (data.type) {
	// 	case 'setSelected':
	// 		// @ts-expect-error - saved for `inspect()`
	// 		if (node) window.$s = node.detail;
	// 		break;

	// 	case 'setHover':
	// 		highlight(node);
	// 		break;

	// 	case 'startPicker':
	// 		startPicker();
	// 		break;

	// 	case 'stopPicker':
	// 		stopPicker();
	// 		break;

	// 	case 'startProfiler':
	// 		profiler.start();
	// 		break;

	// 	case 'stopProfiler':
	// 		profiler.stop();
	// 		break;
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
	});
	switch (node.type) {
		case 'component': {
			const { $$: internal = {} } = node.detail;
			const ctx = clone(node.detail.$capture_state?.() || {});
			const props = Object.keys(internal.props || {}).flatMap((key) => {
				const value = ctx[key];
				delete ctx[key];
				return value === undefined ? [] : { key, value, isBound: key in internal.bound };
			});

			res.detail = {
				attributes: props,
				listeners: Object.entries(internal.callbacks || {}).flatMap(([event, value]) =>
					value.map(/** @param {Function} f */ (f) => ({ event, handler: f.toString() })),
				),
				ctx: Object.entries(ctx).map(([key, value]) => ({ key, value })),
			};
		}

		case 'element': {
			/** @type {Attr[]} from {NamedNodeMap} */
			const attributes = Array.from(node.detail.attributes || []);

			/** @type {NonNullable<SvelteListenerDetail['node']['__listeners']>} */
			const listeners = res.detail.__listeners || [];

			res.detail = {
				attributes: attributes.map(({ name: key, value }) => ({ key, value })),
				listeners: listeners.map((o) => ({ ...o, handler: o.handler.toString() })),
			};
		}

		case 'text': {
			res.detail = {
				nodeValue: node.detail.nodeValue,
			};
		}

		case 'iteration':
		case 'block': {
			const { ctx, source } = node.detail;
			const cloned = Object.entries(clone(ctx));
			res.detail = {
				ctx: cloned.map(([key, value]) => ({ key, value })),
				source: source.slice(source.indexOf('{'), source.indexOf('}') + 1),
			};
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
		send('courier/node:add', {
			node: serialize(node),
			target: node.parent?.id ?? null,
			anchor: anchor?.id ?? null,
		});
	},

	remove(node) {
		send('courier/node:remove', { node: serialize(node) });
	},

	update(node) {
		send('courier/node:update', { node: serialize(node) });
	},

	profile(/** frame */) {
		// send('courier/profile:update', { frame });
	},
});
