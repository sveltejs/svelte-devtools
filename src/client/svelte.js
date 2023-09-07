import { listeners } from './listener.js';
// import { updateProfile } from './profiler.js';

/** @type {any} */
let currentBlock;
let pointer = 0;

/** @param {string | Node} id */
export function getNode(id) {
	return nodes.map.get(id);
}

/**
 * @typedef {DocumentEventMap['SvelteRegisterBlock']['detail']} SvelteBlock
 */

const nodes = {
	/** @type {SvelteBlock[]} */
	root: [],

	/** @type {Map<string | Node, SvelteBlock>} */
	map: new Map(),

	/** @param {{ anchor?: Node; target?: Node; node: SvelteBlock }} opts */
	add({ node, anchor, target }) {
		console.log({ node, anchor, target });

		this.map.set(node.id, node);
		this.map.set(node.detail, node);

		let targetNode = target && this.map.get(target);
		if (!targetNode || targetNode.parentBlock != node.parentBlock) {
			targetNode = node.parentBlock;
		}

		node.parent = targetNode;

		const anchorNode = this.map.get(anchor);

		if (targetNode) {
			let index = -1;
			if (anchorNode) index = targetNode.children.indexOf(anchorNode);

			if (index !== -1) {
				targetNode.children.splice(index, 0, node);
			} else {
				targetNode.children.push(node);
			}
		} else {
			this.root.push(node);
		}

		listeners.add(node, anchorNode);
	},

	remove(node) {
		if (!node) return;

		this.map.delete(node.id);
		this.map.delete(node.detail);

		const index = node.parent.children.indexOf(node);
		node.parent.children.splice(index, 1);
		node.parent = null;

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
		// @ts-expect-error - TODO fix
		nodes.map.set(component.$$.fragment, {
			type: 'component',
			detail: component,
			tagName,
		});
	}
});

let lastPromiseParent;
document.addEventListener('SvelteRegisterBlock', ({ detail }) => {
	console.log(detail);
	const { type, id, block, ...rest } = detail;
	const nodeId = pointer++;

	if (block.m) {
		// const mountFn = block.m;
		block.m = (target, anchor) => {
			const parentBlock = currentBlock;
			let node = {
				id: nodeId,
				type: 'block',
				detail: rest,
				tagName: type === 'pending' ? 'await' : type,
				parentBlock,
				children: [],
			};

			switch (type) {
				case 'then':
				case 'catch':
					if (!node.parentBlock) node.parentBlock = lastPromiseParent;
					break;

				case 'slot':
					node.type = 'slot';
					break;

				case 'component':
					const componentNode = nodes.map.get(block);
					if (componentNode) {
						nodes.map.delete(block);
						Object.assign(node, componentNode);
					} else {
						Object.assign(node, {
							type: 'component',
							tagName: 'Unknown',
							detail: {},
						});
						nodes.map.set(block, node);
					}

					Promise.resolve().then(
						() =>
							node.detail.$$ && Object.keys(node.detail.$$.bound).length && listeners.update(node),
					);
					break;
			}

			if (type === 'each') {
				let group = nodes.map.get(parentBlock.id + id);
				if (!group) {
					group = {
						id: pointer++,
						type: 'block',
						detail: {
							ctx: {},
							source: detail.source,
						},
						tagName: 'each',
						parentBlock,
						children: [],
					};
					nodes.map.set(parentBlock.id + id, group);
					nodes.add({ node: group, target, anchor });
				}
				node.parentBlock = group;
				node.type = 'iteration';
				nodes.add({ node, target: group, anchor });
			} else {
				nodes.add({ node, target, anchor });
			}

			currentBlock = node;
			// updateProfile(node, 'mount', mountFn, target, anchor);
			currentBlock = parentBlock;
		};
	}

	if (block.p) {
		// const patchFn = block.p;
		block.p = (changed, ctx) => {
			const parentBlock = currentBlock;
			currentBlock = nodes.map.get(nodeId);

			listeners.update(currentBlock);

			// updateProfile(currentBlock, 'patch', patchFn, changed, ctx);

			currentBlock = parentBlock;
		};
	}

	if (block.d) {
		// const detachFn = block.d;
		block.d = (detaching) => {
			const node = nodes.map.get(nodeId);

			if (node) {
				if (node.tagName == 'await') lastPromiseParent = node.parentBlock;

				nodes.remove(node);
			}

			// updateProfile(node, 'detach', detachFn, detaching);
		};
	}
});

document.addEventListener('SvelteDOMInsert', ({ detail }) => {
	console.log('SDI', detail);

	deep_insert(detail); // { node, target, anchor }

	/** @type {typeof nodes['add']} */
	function deep_insert({ node: element, target, anchor }) {
		const type =
			element.nodeType === 1
				? 'element'
				: element.nodeValue && element.nodeValue !== ' '
				? 'text'
				: 'anchor';

		nodes.add({
			anchor,
			target,
			node: {
				id: pointer++,
				type,
				detail: element,
				tagName: element.nodeName.toLowerCase(),
				parentBlock: currentBlock,
				children: [],
			},
		});

		for (const child of element.childNodes) {
			if (nodes.map.has(child)) continue;
			deep_insert({ node: child, target: element });
		}
	}
});

document.addEventListener('SvelteDOMRemove', ({ detail }) => {
	const node = nodes.map.get(detail.node);
	if (node) nodes.remove(node);
});

document.addEventListener('SvelteDOMAddEventListener', ({ detail }) => {
	const { node, ...rest } = detail;
	if (!node.__listeners) node.__listeners = [];
	node.__listeners.push(rest);
});

document.addEventListener('SvelteDOMRemoveEventListener', ({ detail }) => {
	const { node, event, handler, modifiers } = detail;

	if (!node.__listeners) return;

	const index = node.__listeners.findIndex(
		(o) => o.event == event && o.handler == handler && o.modifiers == modifiers,
	);

	if (index === -1) return;

	node.__listeners.splice(index, 1);
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
