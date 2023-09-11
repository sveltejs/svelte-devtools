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

type DebugNode = Omit<SvelteBlockDetail, 'parent' | 'children'> & {
	invalidate(): void;
	expanded: boolean;

	parent: DebugNode;
	children: DebugNode[];
	dom?: HTMLLIElement;
};
export const selected = writable<undefined | DebugNode>(undefined);
export const hovered = writable<undefined | DebugNode>(undefined);
export const root = writable<DebugNode[]>([]);

export const query = writable('');
export const profileFrame = writable({});
