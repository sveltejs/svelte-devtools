import { hovered, root, selected } from './store';

const tabId = chrome.devtools.inspectedWindow.tabId;
const port = chrome.runtime.connect({ name: `${tabId}` });

port.postMessage({ source: 'svelte-devtools', tabId, type: 'ext/init' });

export const background = {
	send(type: `${'ext' | 'page'}/${string}`, payload?: any) {
		port.postMessage({ source: 'svelte-devtools', tabId, type, payload });
	},
};

const nodes = new Map();

function insertNode(node: any, target: any, anchorId: number) {
	node.parent = target;

	const index = anchorId ? target.children.findIndex((o: any) => o.id === anchorId) : -1;

	if (index !== -1) {
		target.children.splice(index, 0, node);
	} else {
		target.children.push(node);
	}

	target.invalidate();
}

function resolveEventBubble(node: any) {
	if (!node.detail || !node.detail.listeners) return;

	for (const listener of node.detail.listeners) {
		if (!listener.handler.includes('bubble($$self, event)')) continue;

		listener.handler = () => {
			let target = node;
			while ((target = target.parent)) if (target.type === 'component') break;

			const listeners = target.detail.listeners;
			if (!listeners) return null;

			const parentListener = listeners.find((o: any) => o.event === listener.event);
			if (!parentListener) return null;

			const handler = parentListener.handler;
			if (!handler) return null;

			return `// From parent\n${handler}`;
		};
	}
}

port.onMessage.addListener(({ type, payload }) => {
	switch (type) {
		case 'ext/clear': {
			selected.set(undefined);
			hovered.set(undefined);
			return root.set([]);
		}

		case 'ext/inspect': {
			const current = nodes.get(payload.node.id);
			return selected.set(current);
		}

		case 'courier/node:add': {
			const { node, target, anchor } = payload;

			node.children = [];
			node.expanded = false;
			node.invalidate = () => {};
			resolveEventBubble(node);

			const map_node = nodes.get(target);
			nodes.set(node.id, node);

			if (map_node) {
				insertNode(node, map_node, anchor);
				return;
			}

			if (node._timeout) return;

			node._timeout = setTimeout(() => {
				delete node._timeout;
				const targetNode = nodes.get(target);
				if (targetNode) insertNode(node, targetNode, anchor);
				else root.update((o) => [...o, node]);
			}, 100);

			break;
		}

		case 'courier/node:remove': {
			const current = nodes.get(payload.node.id);
			nodes.delete(current.id);
			if (!current.parent) break;

			const index = current.parent.children.findIndex((o: any) => o.id === current.id);
			current.parent.children.splice(index, 1);
			current.parent.invalidate();
			break;
		}

		case 'courier/node:update': {
			const current = nodes.get(payload.node.id);
			if (!current) return; // TODO: investigate why this happens
			Object.assign(current, payload.node);
			resolveEventBubble(current);

			selected.update((o) => o);
			return current.invalidate();
		}

		// case 'courier/profile:update': {
		// 	resolveFrame(frame);
		// 	profileFrame.set(frame);
		// 	break;

		// 	function resolveFrame(frame) {
		// 		frame.children.forEach(resolveFrame);

		// 		if (!frame.node) return;

		// 		frame.node = nodes.get(frame.node) || {
		// 			type: 'Unknown',
		// 			tagName: 'Unknown',
		// 		};
		// 	}
		// }
	}
});
