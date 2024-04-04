import { type DebugNode, hovered, root, selected } from './store';

const tabId = chrome.devtools.inspectedWindow.tabId;
const port = chrome.runtime.connect({ name: `${tabId}` });

port.postMessage({ source: 'svelte-devtools', tabId, type: 'bypass::ext/init' });

export const background = {
	send(type: `bridge::${'ext' | 'page'}/${string}` | 'bypass::ext/page->refresh', payload?: any) {
		port.postMessage({ source: 'svelte-devtools', tabId, type, payload });
	},
};

const nodes = {} as { [key: string]: DebugNode };

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
		case 'bridge::ext/clear': {
			selected.set(undefined);
			hovered.set(undefined);
			root.set([]);
			break;
		}

		case 'bridge::ext/inspect': {
			if (typeof payload === 'string') break;
			const current = nodes[payload.node.id];
			selected.set(current);
			break;
		}

		case 'bridge::courier/node->add': {
			const { node, target, anchor } = payload as {
				node: DebugNode;
				target: string;
				anchor: string;
			};

			node.children = [];
			node.expanded = false;
			node.invalidate = () => {};
			resolveEventBubble(node);

			const parent = nodes[target];
			nodes[node.id] = node;
			if (!parent) {
				root.update((n) => [...n, node]);
				break;
			}

			const index = parent.children.findIndex((n) => n.id === anchor);
			if (index === -1) parent.children.push(node);
			else parent.children.splice(index, 0, node);

			(node.parent = parent).invalidate();
			break;
		}

		case 'bridge::courier/node->remove': {
			const node = payload.node as SvelteBlockDetail;
			const current = nodes[node.id];
			if (current) delete nodes[current.id];
			if (!current?.parent) break;

			const index = current.parent.children.findIndex((o) => o.id === current.id);
			current.parent.children.splice(index, 1);
			current.parent.invalidate();
			break;
		}

		case 'bridge::courier/node->update': {
			const node = payload.node as SvelteBlockDetail;
			const current = nodes[node.id];
			if (!current) break;
			Object.assign(current, payload.node);
			resolveEventBubble(current);

			selected.update((o) => o);
			current.invalidate();
			break;
		}

		// case 'bridge::courier/profile->update': {
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
