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

export type DebugNode = Omit<SvelteBlockDetail, 'parent' | 'children'> & {
	invalidate(): void;
	expanded: boolean;

	tagName: string;
	parent: DebugNode;
	children: DebugNode[];
	dom?: HTMLLIElement;
};
export const selected = writable<undefined | DebugNode>(undefined);
export const hovered = writable<undefined | DebugNode>(undefined);
export const root = writable<DebugNode[]>([]);

export const query = writable('');

export type Profiler = {
	type: 'mount' | 'patch' | 'detach';
	node: { id: string; type: string; tagName: string };
	duration: number;
	start: number;
	end: number;
	children: Profiler[];
};
export const profileFrame = writable<undefined | Profiler>(undefined);
