import { writable } from 'svelte/store';

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
	invalidate(): void;
	expanded: boolean;
	parent: DebugNode;
	children: any[];

	dom?: HTMLLIElement;
}
export const selected = writable<undefined | DebugNode>(undefined);
export const hovered = writable<undefined | DebugNode>(undefined);
export const root = writable<DebugNode[]>([]);

export const query = writable('');
export const profileFrame = writable({});
