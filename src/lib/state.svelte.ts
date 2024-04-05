type Overwrite<A, B> = Omit<A, keyof B> & B;

export type DebugNode = Overwrite<
	SvelteBlockDetail,
	{
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

export const app = $state({
	nodes: {} as { [key: string]: DebugNode },
	get root() {
		const nodes = Object.values(this.nodes);
		return nodes.filter((node) => !node.parent);
	},

	selected: undefined as undefined | DebugNode,
	hovered: undefined as undefined | DebugNode,

	inspecting: false,
	query: '',
});

export const visibility = $state<{ [key: string]: boolean }>({
	component: true,
	element: true,
	block: true,
	iteration: true,
	slot: true,
	text: true,
	anchor: false,
});
