import { writable, get } from 'svelte/store';
import { background } from './runtime';

export const visibility = writable({
	component: true,
	element: true,
	block: true,
	iteration: true,
	slot: true,
	text: true,
	anchor: false,
});
export const selectedNode = writable({
	id: '',
	type: '',
	detail: {} as any,
});
export const hoveredNodeId = writable(-1);
export const rootNodes = writable([]);
export const searchValue = writable('');
export const profilerEnabled = writable(false);
export const profileFrame = writable({});

// function interactableNodes(list = []) {
// 	const _visibility = get(visibility);
// 	return list.filter((o) => _visibility[o.type] && o.type !== 'text' && o.type !== 'anchor');
// }

// window.addEventListener('keydown', (e) => {
// 	if (e.target !== document.body) return;

// 	selectedNode.update((node) => {
// 		if (node.invalidate === undefined) return node;
// 		switch (e.key) {
// 			case 'Enter': {
// 				node.collapsed = !node.collapsed;
// 				node.invalidate();
// 				return node;
// 			}
// 			case 'ArrowRight': {
// 				node.collapsed = false;
// 				node.invalidate();
// 				return node;
// 			}
// 			case 'ArrowDown': {
// 				const children = interactableNodes(node.children);

// 				if (node.collapsed || children.length === 0) {
// 					var next = node;
// 					var current = node;
// 					do {
// 						const siblings = interactableNodes(
// 							current.parent === undefined ? get(rootNodes) : current.parent.children,
// 						);
// 						const index = siblings.findIndex((o) => o.id === current.id);
// 						next = siblings[index + 1];

// 						current = current.parent;
// 					} while (next === undefined && current !== undefined);

// 					return next ?? node;
// 				} else {
// 					return children[0];
// 				}
// 			}

// 			case 'ArrowLeft': {
// 				node.collapsed = true;
// 				node.invalidate();
// 				return node;
// 			}
// 			case 'ArrowUp': {
// 				const siblings = interactableNodes(
// 					node.parent === undefined ? get(rootNodes) : node.parent.children,
// 				);
// 				const index = siblings.findIndex((o) => o.id === node.id);
// 				return index > 0 ? siblings[index - 1] : node.parent ?? node;
// 			}

// 			default:
// 				return node;
// 		}
// 	});
// });

const nodeMap = new Map();

selectedNode.subscribe((node) => {
	background.postMessage({
		type: 'setSelected',
		tabId: chrome.devtools.inspectedWindow.tabId,
		nodeId: node.id,
	});

	let invalid = null;
	while (node.parent) {
		node = node.parent;
		if (node.collapsed) {
			invalid = node;
			node.collapsed = false;
		}
	}

	if (invalid) invalid.invalidate();
});

hoveredNodeId.subscribe((nodeId) =>
	background.postMessage({
		type: 'setHover',
		tabId: chrome.devtools.inspectedWindow.tabId,
		nodeId,
	}),
);

// profilerEnabled.subscribe((o) =>
// 	port.postMessage({
// 		type: o ? 'startProfiler' : 'stopProfiler',
// 		tabId: chrome.devtools.inspectedWindow.tabId,
// 	}),
// );

function insertNode(node, target, anchorId) {
	node.parent = target;

	const index = anchorId ? target.children.findIndex((o) => o.id == anchorId) : -1;

	if (index !== -1) {
		target.children.splice(index, 0, node);
	} else {
		target.children.push(node);
	}

	target.invalidate();
}

function resolveEventBubble(node) {
	if (!node.detail || !node.detail.listeners) return;

	for (const listener of node.detail.listeners) {
		if (!listener.handler.includes('bubble($$self, event)')) continue;

		listener.handler = () => {
			let target = node;
			while ((target = target.parent)) if (target.type == 'component') break;

			const listeners = target.detail.listeners;
			if (!listeners) return null;

			const parentListener = listeners.find((o) => o.event == listener.event);
			if (!parentListener) return null;

			const handler = parentListener.handler;
			if (!handler) return null;

			return '// From parent\n' + (typeof handler == 'function' ? handler() : handler);
		};
	}
}

background.onMessage.addListener(({ type, node, target, anchor /**, frame */ }) => {
	console.log({ type, node, target, anchor });
	switch (type) {
		case 'ext/clear': {
			selectedNode.set({});
			hoveredNodeId.set(-1);
			rootNodes.set([]);

			break;
		}

		case 'courier/node:add': {
			console.log('adding nodes from courier');
			node.children = [];
			node.collapsed = true;
			node.invalidate = () => {};
			resolveEventBubble(node);

			const targetNode = nodeMap.get(target);
			nodeMap.set(node.id, node);

			if (targetNode) {
				insertNode(node, targetNode, anchor);
				return;
			}

			if (node._timeout) return;

			node._timeout = setTimeout(() => {
				delete node._timeout;
				const targetNode = nodeMap.get(target);
				if (targetNode) insertNode(node, targetNode, anchor);
				else rootNodes.update((o) => [...o, node]);
			}, 100);

			break;
		}

		case 'courier/node:remove': {
			const current = nodeMap.get(node.id);
			nodeMap.delete(current.id);

			if (!current.parent) break;

			const index = current.parent.children.findIndex((o) => o.id == current.id);
			current.parent.children.splice(index, 1);

			current.parent.invalidate();

			break;
		}

		case 'courier/node:update': {
			const current = nodeMap.get(node.id);
			Object.assign(current, node);
			resolveEventBubble(current);

			const selected = get(selectedNode);
			if (selected && selected.id == node.id) selectedNode.update((o) => o);

			return current.invalidate();
		}

		case 'inspect': {
			const current = nodeMap.get(node.id);
			return selectedNode.set(current);
		}

		// case 'courier:profile.update': {
		// 	resolveFrame(frame);
		// 	profileFrame.set(frame);
		// 	break;

		// 	function resolveFrame(frame) {
		// 		frame.children.forEach(resolveFrame);

		// 		if (!frame.node) return;

		// 		frame.node = nodeMap.get(frame.node) || {
		// 			type: 'Unknown',
		// 			tagName: 'Unknown',
		// 		};
		// 	}
		// }
	}
});
