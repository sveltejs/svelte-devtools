import { addListener } from './listener.js';
import { highlight } from './highlight.js';
import { getNode } from './svelte.js';

// window.__svelte_devtools_inject_state = (id, key, value) => {
// 	const { detail: component } = getNode(id) || {};
// 	component.$inject_state({ [key]: value });
// };

window.addEventListener('message', ({ source, data }) => {
	// only accept messages from our application or script
	if (source !== window || data?.source !== 'svelte-devtools') return;

	switch (data.type) {
		case 'ext/select': {
			const node = getNode(data.payload);
			// @ts-expect-error - saved for `inspect()`
			if (node) window.$s = node.detail;
			return;
		}
		case 'ext/highlight': {
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
	}
});

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

function serialize(node) {
	switch (node.type) {
		case 'component': {
			if (!node.detail.$$) {
				return {
					id: node.id,
					type: node.type,
					tagName: node.tagName,
					detail: {},
				};
			}

			console.log('serializing component', node);

			const { $$: internal } = node.detail;
			const props = Object.keys(internal.props);
			const ctx = clone(node.detail.$capture_state()) || {};

			return {
				id: node.id,
				type: node.type,
				tagName: node.tagName,
				detail: {
					attributes: props.flatMap((key) => {
						const value = ctx[key];
						delete ctx[key];
						return value === undefined ? [] : { key, value, bounded: key in internal.bound };
					}),
					listeners: Object.entries(internal.callbacks).flatMap(([event, value]) =>
						value.map((o) => ({ event, handler: o.toString() })),
					),
					ctx: Object.entries(ctx).map(([key, value]) => ({ key, value })),
				},
			};
		}

		case 'element': {
			const attributes = node.detail.attributes || [];

			/** @type {NonNullable<SvelteListenerDetail['node']['SDT:listeners']>} */
			const listeners = node.detail['SDT:listeners'] || [];

			console.log({ attributes, listeners });

			return {
				id: node.id,
				type: node.type,
				tagName: node.tagName,
				detail: {
					attributes: Array.from(attributes).map((attr) => ({
						key: attr.name,
						value: attr.value,
					})),
					listeners: listeners.map((o) => ({ ...o, handler: o.handler.toString() })),
				},
			};
		}

		case 'text': {
			return {
				id: node.id,
				type: node.type,
				tagName: node.tagName,
				detail: {
					nodeValue: node.detail.nodeValue,
				},
			};
		}

		case 'iteration':
		case 'block': {
			const { ctx, source } = node.detail;
			const cloned = Object.entries(clone(ctx));
			return {
				id: node.id,
				type: node.type,
				tagName: node.tagName,
				detail: {
					ctx: cloned.map(([key, value]) => ({ key, value })),
					source: source.substring(source.indexOf('{'), source.indexOf('}') + 1),
				},
			};
		}

		default: {
			return {
				id: node.id,
				type: node.type,
				tagName: node.tagName,
				detail: {},
			};
		}
	}
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
		console.log('adding root node', { node, anchor });
		send('courier/node:add', {
			node: serialize(node),
			target: node.parent?.id ?? null,
			anchor: anchor?.id ?? null,
		});
	},

	remove(node) {
		console.log('removing root node', { node });
		send('courier/node:remove', { node: serialize(node) });
	},

	update(node) {
		console.log('updating root node', { node });
		send('courier/node:update', { node: serialize(node) });
	},

	profile(/** frame */) {
		// console.log('profiling frame', { frame });
		// send('courier/profile:update', { frame });
	},
});
