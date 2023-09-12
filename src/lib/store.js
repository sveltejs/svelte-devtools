import { writable, get } from 'svelte/store';

export const visibility = writable({
	component: true,
	element: true,
	block: true,
	iteration: true,
	slot: true,
	text: true,
	anchor: false,
});
export const selectedNode = writable({});
export const hoveredNodeId = writable(null);
export const rootNodes = writable([]);
export const searchValue = writable('');
export const profilerEnabled = writable(false);
export const profileFrame = writable({});

/**
// zoom workaround for firefox
let fontSize = 11;
window.addEventListener('keyup', (e) => {
	if (!e.ctrlKey) return;

	switch (e.key) {
		case '=':
			fontSize = Math.min(fontSize + 1.1, 22);
			break;
		case '-':
			fontSize = Math.max(fontSize - 1.1, 5.5);
			break;
		case '0':
			fontSize = 11;
			break;
	}

	document.documentElement.style.fontSize = fontSize + 'px';
});
*/

function interactableNodes(list) {
	const _visibility = get(visibility);
	return list.filter((o) => _visibility[o.type] && o.type !== 'text' && o.type !== 'anchor');
}

window.addEventListener('keydown', (e) => {
	if (e.target !== document.body) return;

	selectedNode.update((node) => {
		if (node.invalidate === undefined) return node;
		switch (e.key) {
			case 'Enter':
				node.collapsed = !node.collapsed;
				node.invalidate();
				return node;

			case 'ArrowRight':
				node.collapsed = false;
				node.invalidate();
				return node;

			case 'ArrowDown': {
				const children = interactableNodes(node.children);

				if (node.collapsed || children.length === 0) {
					var next = node;
					var current = node;
					do {
						const siblings = interactableNodes(
							current.parent === undefined ? get(rootNodes) : current.parent.children,
						);
						const index = siblings.findIndex((o) => o.id === current.id);
						next = siblings[index + 1];

						current = current.parent;
					} while (next === undefined && current !== undefined);

					return next ?? node;
				} else {
					return children[0];
				}
			}

			case 'ArrowLeft':
				node.collapsed = true;
				node.invalidate();
				return node;

			case 'ArrowUp': {
				const siblings = interactableNodes(
					node.parent === undefined ? get(rootNodes) : node.parent.children,
				);
				const index = siblings.findIndex((o) => o.id === node.id);
				return index > 0 ? siblings[index - 1] : node.parent ?? node;
			}

			default:
				return node;
		}
	});
});

const nodeMap = new Map();

const port = chrome.runtime.connect();

/* Include all relevant content script settings in
 * message itself to avoid extra async queries
 */
port.postMessage({
	type: 'init',
	profilerEnabled: get(profilerEnabled),
	tabId: chrome.devtools.inspectedWindow.tabId,
});

export function reload() {
	port.postMessage({
		type: 'reload',
		tabId: chrome.devtools.inspectedWindow.tabId,
	});
}

export function startPicker() {
	port.postMessage({
		type: 'startPicker',
		tabId: chrome.devtools.inspectedWindow.tabId,
	});
}

export function stopPicker() {
	port.postMessage({
		type: 'stopPicker',
		tabId: chrome.devtools.inspectedWindow.tabId,
	});
}

selectedNode.subscribe((node) => {
	port.postMessage({
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
	port.postMessage({
		type: 'setHover',
		tabId: chrome.devtools.inspectedWindow.tabId,
		nodeId,
	}),
);

profilerEnabled.subscribe((o) =>
	port.postMessage({
		type: o ? 'startProfiler' : 'stopProfiler',
		tabId: chrome.devtools.inspectedWindow.tabId,
	}),
);

function noop() {}

function insertNode(node, target, anchorId) {
	node.parent = target;

	let index = -1;
	if (anchorId) index = target.children.findIndex((o) => o.id == anchorId);

	if (index != -1) {
		target.children.splice(index, 0, node);
	} else {
		target.children.push(node);
	}

	target.invalidate();
}

function resolveFrame(frame) {
	frame.children.forEach(resolveFrame);

	if (!frame.node) return;

	frame.node = nodeMap.get(frame.node) || {
		tagName: 'Unknown',
		type: 'Unknown',
	};
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

port.onMessage.addListener((msg) => {
	switch (msg.type) {
		case 'clear': {
			selectedNode.set({});
			hoveredNodeId.set(null);
			rootNodes.set([]);

			break;
		}

		case 'addNode': {
			const node = msg.node;
			node.children = [];
			node.collapsed = true;
			node.invalidate = noop;
			resolveEventBubble(node);

			const targetNode = nodeMap.get(msg.target);
			nodeMap.set(node.id, node);

			if (targetNode) {
				insertNode(node, targetNode, msg.anchor);
				return;
			}

			if (node._timeout) return;

			node._timeout = setTimeout(() => {
				delete node._timeout;
				const targetNode = nodeMap.get(msg.target);
				if (targetNode) insertNode(node, targetNode, msg.anchor);
				else rootNodes.update((o) => (o.push(node), o));
			}, 100);

			break;
		}

		case 'removeNode': {
			const node = nodeMap.get(msg.node.id);
			nodeMap.delete(node.id);

			if (!node.parent) break;

			const index = node.parent.children.findIndex((o) => o.id == node.id);
			node.parent.children.splice(index, 1);

			node.parent.invalidate();

			break;
		}

		case 'updateNode': {
			const node = nodeMap.get(msg.node.id);
			Object.assign(node, msg.node);
			resolveEventBubble(node);

			const selected = get(selectedNode);
			if (selected && selected.id == msg.node.id) selectedNode.update((o) => o);

			node.invalidate();

			break;
		}

		case 'inspect': {
			let node = nodeMap.get(msg.node.id);
			selectedNode.set(node);

			break;
		}

		case 'updateProfile': {
			resolveFrame(msg.frame);
			profileFrame.set(msg.frame);
			break;
		}
	}
});
