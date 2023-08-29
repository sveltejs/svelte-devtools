import { writable } from 'svelte/store';

export const port = writable({} as chrome.runtime.Port);

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
export const hoveredNodeId = writable(-1);
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

const nodeMap = new Map();

export function reload() {
	// 	port.postMessage({
	// 		type: 'reload',
	// 		tabId: chrome.devtools.inspectedWindow.tabId,
	// 	});
}

export function startPicker() {
	// 	port.postMessage({
	// 		type: 'startPicker',
	// 		tabId: chrome.devtools.inspectedWindow.tabId,
	// 	});
}

export function stopPicker() {
	// port.postMessage({
	// 	type: 'stopPicker',
	// 	tabId: chrome.devtools.inspectedWindow.tabId,
	// });
}

// selectedNode.subscribe((node) => {
// 	port.postMessage({
// 		type: 'setSelected',
// 		tabId: chrome.devtools.inspectedWindow.tabId,
// 		nodeId: node.id,
// 	});

// 	let invalid = null;
// 	while (node.parent) {
// 		node = node.parent;
// 		if (node.collapsed) {
// 			invalid = node;
// 			node.collapsed = false;
// 		}
// 	}

// 	if (invalid) invalid.invalidate();
// });

// hoveredNodeId.subscribe((nodeId) =>
// 	port.postMessage({
// 		type: 'setHover',
// 		tabId: chrome.devtools.inspectedWindow.tabId,
// 		nodeId,
// 	}),
// );

// profilerEnabled.subscribe((o) =>
// 	port.postMessage({
// 		type: o ? 'startProfiler' : 'stopProfiler',
// 		tabId: chrome.devtools.inspectedWindow.tabId,
// 	}),
// );

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
