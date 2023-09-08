import { writable } from 'svelte/store';
import { background } from './runtime';

export const visibility = writable<{ [key: string]: boolean }>({
	component: true,
	element: true,
	block: true,
	iteration: true,
	slot: true,
	text: true,
	anchor: false,
});

interface DebugNode {
	id: number;
	type: string;
	detail: any;
	tagName: string;
	invalidate?: () => void;
	expanded: boolean;
	parent: DebugNode;
	children: any[];
}
export const selected = writable<undefined | DebugNode>(undefined);
export const hovered = writable<undefined | DebugNode>(undefined);
export const root = writable<DebugNode[]>([]);

export const query = writable('');
export const profilerEnabled = writable(false);
export const profileFrame = writable({});

selected.subscribe((node) => {
	background.postMessage({
		type: 'setSelected',
		tabId: chrome.devtools.inspectedWindow.tabId,
		nodeId: node?.id,
	});

	let invalid = null;
	while (node?.parent) {
		node = node.parent;
		if (!node.expanded) {
			invalid = node;
			node.expanded = true;
		}
	}

	if (invalid) invalid.invalidate?.();
});

hovered.subscribe((node) =>
	background.postMessage({
		source: 'svelte-devtools',
		type: 'ext/highlight',
		tabId: chrome.devtools.inspectedWindow.tabId,
		nodeId: node?.id,
	}),
);

// profilerEnabled.subscribe((o) =>
// 	port.postMessage({
// 		type: o ? 'startProfiler' : 'stopProfiler',
// 		tabId: chrome.devtools.inspectedWindow.tabId,
// 	}),
// );
