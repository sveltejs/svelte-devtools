import { addNodeListener } from './listener.js';
import { highlight, startPicker, stopPicker } from './highlight.js';
import { getNode } from './svelte.js';

window.__svelte_devtools_inject_state = function (id, key, value) {
	let component = getNode(id).detail;
	component.$inject_state({ [key]: value });
};

// window.__svelte_devtools_select_element = function (element) {
// 	let node = getNode(element);
// 	if (node) window.postMessage({ type: 'inspect', node: serializeNode(node) });
// };

window.addEventListener('message', ({ source, data }) => {
	console.log({ message: data });

	// only accept messages from our application or script
	if (source !== window || data?.source !== 'svelte-devtools') return;

	const node = getNode(data.nodeId);

	switch (data.type) {
		case 'setSelected': {
			if (node) window.$s = node.detail;
			break;
		}
		case 'setHover': {
			return highlight(node);
		}

		case 'startPicker':
			return startPicker();

		case 'stopPicker':
			return stopPicker();

		// case 'startProfiler':
		// 	return startProfiler();

		// case 'stopProfiler':
		// 	return stopProfiler();
	}
});

function clone(value, seen = new Map()) {
	switch (typeof value) {
		case 'function':
			return { __isFunction: true, source: value.toString(), name: value.name };
		case 'symbol':
			return { __isSymbol: true, name: value.toString() };
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

			const { $$: internal } = node.detail;
			const props = Object.keys(internal.props);
			let ctx = clone(node.detail.$capture_state());
			if (ctx === undefined) ctx = {};

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
			const { attributes, __listeners = [] } = node.detail;

			return {
				id: node.id,
				type: node.type,
				tagName: node.tagName,
				detail: {
					attributes: Array.from(attributes).map((attr) => ({
						key: attr.name,
						value: attr.value,
					})),
					listeners: __listeners.map((o) => ({ ...o, handler: o.handler.toString() })),
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
	}
}

const source = 'svelte-devtools';
addNodeListener({
	add(node, anchor) {
		console.log('adding', { node, anchor });
		window.postMessage({
			source,
			type: 'courier/node:add',
			node: serialize(node),
			target: node.parent?.id ?? null,
			anchor: anchor?.id ?? null,
		});
	},

	remove(node) {
		window.postMessage({
			source,
			type: 'courier/node:remove',
			node: serialize(node),
		});
	},

	update(node) {
		window.postMessage({
			source,
			type: 'courier/node:update',
			node: serialize(node),
		});
	},

	profile(/** frame */) {
		console.log('profiling temporarily disabled');
		// window.postMessage({
		// 	type: 'courier/profile:update',
		// 	frame,
		// });
	},
});
