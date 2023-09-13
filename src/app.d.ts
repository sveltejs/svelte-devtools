/// <reference types="svelte" />
/// <reference types="vite/client" />

interface SvelteDevInternal {
	version: string;
}

declare global {
	type SvelteComponentDetail = {
		id: string;
		options: {
			$$inline?: boolean;
			hydrate?: boolean;
			target?: Element;
			props?: Record<string, any>;
		};
		tagName: string;
		component: {
			$$: {
				fragment: {
					c(): void;
					d(detaching: boolean): void;
					h(): void;
					l(nodes: any[]): void;
					m(target: Node, anchor: Node): void;
					p(changed: boolean, ctx: any): void;
				};
			};
			$$events_def?: {};
			$$prop_def?: {};
			$$slot_def?: {};
			$capture_state(): any;
		};
	};

	type SvelteBlockDetail = {
		id: number;
		source: string;
		type:
			| 'anchor'
			| 'block'
			| 'catch'
			| 'component'
			| 'each'
			| 'element'
			| 'else'
			| 'if'
			| 'iteration'
			| 'key'
			| 'pending'
			| 'slot'
			| 'text'
			| 'then';

		detail?: any;
		tagName?: string;

		parent?: SvelteBlockDetail;
		parentBlock?: SvelteBlockDetail;
		children: SvelteBlockDetail[];

		block: SvelteComponentDetail['component']['$$']['fragment'];
		ctx: Array<any>; // TODO: do we need this typed?
	};

	type SvelteListenerDetail = {
		node: Node & {
			__listeners?: Omit<SvelteListenerDetail, 'node'>[];
		};
		event: string;
		handler: EventListenerOrEventListenerObject;
		modifiers: Array<'capture' | 'preventDefault' | 'stopPropagation' | 'stopImmediatePropagation'>;
	};

	interface DocumentEventMap {
		SvelteRegisterComponent: CustomEvent<SvelteDevInternal & SvelteComponentDetail>;

		SvelteRegisterBlock: CustomEvent<SvelteDevInternal & SvelteBlockDetail>;

		SvelteDOMInsert: CustomEvent<SvelteDevInternal & { target: Node; node: Node; anchor?: Node }>;
		SvelteDOMRemove: CustomEvent<SvelteDevInternal & { node: Node }>;

		SvelteDOMAddEventListener: CustomEvent<SvelteDevInternal & SvelteListenerDetail>;
		SvelteDOMRemoveEventListener: CustomEvent<SvelteDevInternal & SvelteListenerDetail>;

		SvelteDOMSetAttribute: CustomEvent<
			SvelteDevInternal & {
				node: Element;
				attribute: string;
				value?: string;
			}
		>;
		SvelteDOMRemoveAttribute: CustomEvent<
			SvelteDevInternal & {
				node: Element;
				attribute: string;
			}
		>;
		SvelteDOMSetProperty: CustomEvent<
			SvelteDevInternal & {
				node: Element;
				property: string;
				value?: any;
			}
		>;
		SvelteDOMSetDataset: CustomEvent<
			SvelteDevInternal & {
				node: HTMLElement;
				property: string;
				value?: any;
			}
		>;
		SvelteDOMSetData: CustomEvent<
			SvelteDevInternal & {
				node: Text;
				data: unknown;
			}
		>;
	}
}

export {};
