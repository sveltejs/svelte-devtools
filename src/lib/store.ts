import { writable } from 'svelte/store';

type Overwrite<A, B> = Omit<A, keyof B> & B;

export type DebugNode = Overwrite<
	SvelteBlockDetail,
	{
		invalidate(): void;
		expanded: boolean;
		detail: {
			attributes?: Array<{
				key: string;
				value: string;
				bounded?: boolean;
				flash?: boolean;
			}>;
			listeners?: Array<{
				event: any;
				handler: any;
				modifiers: any;
			}>;
			ctx: any;
			source: string;
			nodeValue: string;
		};

		tagName: string;
		parent: DebugNode;
		children: DebugNode[];
		dom?: HTMLLIElement;
	}
>;
export const selected = writable<undefined | DebugNode>(undefined);
export const hovered = writable<undefined | DebugNode>(undefined);
export const root = writable<DebugNode[]>([]);
export const visibility = writable<{ [key: string]: boolean }>({
	component: true,
	element: true,
	block: true,
	iteration: true,
	slot: true,
	text: true,
	anchor: false,
});

export const query = writable('');

export type Profiler = {
	type: 'mount' | 'patch' | 'detach';
	node: DebugNode;
	duration: number;
	start: number;
	end: number;
	children: Profiler[];
};
export const profileFrame = writable<undefined | Profiler>(undefined);
