import { listeners } from './listener.js';
// import { profiler } from './profiler.js';

/** @type {undefined | SvelteBlockDetail} */
let current_block;
let pointer = 0;

/** @param {number | Node} id */
export function getNode(id) {
	return nodes.map.get(id);
}

const nodes = {
	/** @type {SvelteBlockDetail[]} */
	root: [],

	/** @type {Map<any, SvelteBlockDetail>} */
	map: new Map(),

	/** @param {{ node: SvelteBlockDetail; target?: Node; anchor?: Node }} opts */
	add({ node, target, anchor }) {
		this.map.set(node.id, node);
		this.map.set(node.detail, node);

		let map_target = target && this.map.get(target);
		if (!map_target || map_target.parentBlock != node.parentBlock) {
			map_target = node.parentBlock;
		}

		node.parent = map_target;

		const map_anchor = this.map.get(anchor);

		if (map_target) {
			const index = map_target.children.findIndex((n) => n === map_anchor);
			if (index === -1) map_target.children.push(node);
			else map_target.children.splice(index, 0, node);
		} else {
			this.root.push(node);
		}

		listeners.add(node, map_anchor);
	},

	/** @param {SvelteBlockDetail} node */
	remove(node) {
		if (!node) return;

		this.map.delete(node.id);
		this.map.delete(node.detail);

		if (node.parent) {
			node.parent.children = node.parent.children.filter((n) => n !== node);
			node.parent = undefined;
		}

		listeners.remove(node);
	},
};

document.addEventListener('SvelteRegisterComponent', ({ detail }) => {
	const { component, tagName } = detail;

	const node = nodes.map.get(component.$$.fragment);
	if (node) {
		nodes.map.delete(component.$$.fragment);

		node.detail = component;
		node.tagName = tagName;

		listeners.update(node);
	} else {
		// @ts-expect-error - component special case
		nodes.map.set(component.$$.fragment, {
			type: 'component',
			detail: component,
			tagName,
		});
	}
});

/** @type {any} */
let last_promise;
document.addEventListener('SvelteRegisterBlock', ({ detail }) => {
	const { type, id, block, ...rest } = detail;
	const current_node_id = pointer++;

	if (block.m) {
		const original = block.m;
		block.m = (target, anchor) => {
			const parent = current_block;

			// @ts-expect-error - only the necessities
			const node = /** @type {SvelteBlockDetail} */ ({
				id: current_node_id,
				type: 'block',
				detail: rest,
				tagName: type === 'pending' ? 'await' : type,
				parentBlock: parent,
				children: [],
			});

			switch (type) {
				case 'then':
				case 'catch':
					if (!node.parentBlock) node.parentBlock = last_promise;
					break;

				case 'slot':
					node.type = 'slot';
					break;

				case 'component': {
					const component = nodes.map.get(block);
					if (component) {
						nodes.map.delete(block);
						Object.assign(node, component);
					} else {
						node.type = 'component';
						node.tagName = 'Unknown';
						node.detail = {};
						nodes.map.set(block, node);
					}

					Promise.resolve().then(() => {
						const invalidate = node.detail.$$?.bound || {};
						Object.keys(invalidate).length && listeners.update(node);
					});
					break;
				}
			}

			if (type === 'each') {
				const group =
					(parent && nodes.map.get(parent.id + id)) ||
					// @ts-expect-error - each block fallback
					/** @type {SvelteBlockDetail} */ ({
						version: '',
						id: pointer++,
						type: 'block',
						tagName: 'each',
						parentBlock: parent,
						children: [],
						detail: {
							ctx: {},
							source: detail.source,
						},
					});
				parent && nodes.map.set(parent.id + id, group);
				nodes.add({ node: group, target, anchor });

				node.parentBlock = group;
				node.type = 'iteration';

				// @ts-expect-error - overloaded nodes
				nodes.add({ node, target: group, anchor });
			} else {
				nodes.add({ node, target, anchor });
			}

			current_block = node;

			// profiler.update(node, 'mount', original, target, anchor);
			original(target, anchor);

			current_block = parent;
		};
	}

	if (block.p) {
		const original = block.p;
		block.p = (changed, ctx) => {
			const parent = current_block;
			current_block = nodes.map.get(current_node_id);
			current_block && listeners.update(current_block);

			// profiler.update(current_block, 'patch', original, changed, ctx);
			original(changed, ctx);

			current_block = parent;
		};
	}

	if (block.d) {
		const original = block.d;
		block.d = (detaching) => {
			const node = nodes.map.get(current_node_id);
			if (node) {
				if (node.tagName === 'await') {
					last_promise = node.parentBlock;
				}
				nodes.remove(node);
			}

			// profiler.update(node, 'detach', original, detaching);
			original(detaching);
		};
	}
});

document.addEventListener('SvelteDOMInsert', ({ detail }) => {
	deep_insert(detail); // { node, target, anchor }

	/** @param {Omit<DocumentEventMap['SvelteDOMInsert']['detail'], 'version'>} opts */
	function deep_insert({ node: element, target, anchor }) {
		const type =
			element.nodeType === Node.ELEMENT_NODE
				? 'element'
				: element.nodeValue && element.nodeValue !== ' '
				? 'text'
				: 'anchor';

		nodes.add({
			anchor,
			target,
			// @ts-expect-error - missing properties are irrelevant
			node: {
				id: pointer++,
				type,
				detail: element,
				tagName: element.nodeName.toLowerCase(),
				parentBlock: current_block,
				children: [],
			},
		});

		element.childNodes.forEach((child) => {
			!nodes.map.has(child) && deep_insert({ node: child, target: element });
		});
	}
});

document.addEventListener('SvelteDOMRemove', ({ detail }) => {
	const node = nodes.map.get(detail.node);
	if (node) nodes.remove(node);
});

document.addEventListener('SvelteDOMAddEventListener', ({ detail }) => {
	const { node, ...rest } = detail;
	node.__listeners = node.__listeners || [];
	node.__listeners.push(rest);
});

document.addEventListener('SvelteDOMRemoveEventListener', ({ detail }) => {
	const { node, event, handler, modifiers } = detail;
	if (!node.__listeners || node.__listeners.length) return;
	node.__listeners = node.__listeners.filter(
		(l) => l.event !== event || l.handler !== handler || l.modifiers !== modifiers,
	);
});

document.addEventListener('SvelteDOMSetData', ({ detail }) => {
	const node = nodes.map.get(detail.node);
	if (!node) return;
	if (node.type === 'anchor') node.type = 'text';
	listeners.update(node);
});

document.addEventListener('SvelteDOMSetProperty', ({ detail }) => {
	const node = nodes.map.get(detail.node);
	if (!node) return;
	if (node.type === 'anchor') node.type = 'text';
	listeners.update(node);
});

document.addEventListener('SvelteDOMSetAttribute', ({ detail }) => {
	const node = nodes.map.get(detail.node);
	if (!node) return;
	if (node.type === 'anchor') node.type = 'text';
	listeners.update(node);
});

document.addEventListener('SvelteDOMRemoveAttribute', ({ detail }) => {
	const node = nodes.map.get(detail.node);
	if (!node) return;
	if (node.type === 'anchor') node.type = 'text';
	listeners.update(node);
});
