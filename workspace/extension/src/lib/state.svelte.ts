type Overwrite<A, B> = Omit<A, keyof B> & B;

type AppState = {
	svelteVersion?: number;

	nodes: Record<string, DebugNode>;
	root: Readonly<DebugNode[]>;

	selected?: DebugNode;
	hovered?: DebugNode;

	inspecting: boolean;
	query: string;
}


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

export const app: AppState = $state({
	svelteVersion: undefined,

	nodes: {} as Record<string, DebugNode>,
	get root() {
		const nodes = Object.values(this.nodes);
		return nodes.filter((node) => !node.parent);
	},

	selected: undefined,
	hovered: undefined,

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
