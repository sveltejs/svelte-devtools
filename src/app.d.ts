/// <reference types="svelte" />
/// <reference types="vite/client" />

type Modifiers = Array<
	'capture' | 'preventDefault' | 'stopPropagation' | 'stopImmediatePropagation'
>;

type SvelteListenerDetail = {
	version: string;
	node: Node & {
		__listeners?: Exclude<SvelteDevListener, 'node'>[];
	};
	event: string;
	handler: EventListenerOrEventListenerObject;
	modifiers: Modifiers;
};

declare global {
	interface DocumentEventMap {
		SvelteRegisterComponent: CustomEvent<{
			version: string;
			component: any;
			tagName: string;
			options: any;
			id: string;
		}>;

		SvelteRegisterBlock: CustomEvent<{
			version: string;
			id: string;
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
				| 'key'
				| 'pending'
				| 'slot'
				| 'text'
				| 'then';

			detail?: any;
			tagName?: string;

			block: {
				c(): void;
				d(detaching: boolean): void;
				h(): void;
				l(nodes: any[]): void;
				m(target: Node, anchor: Node): void;
				p(changed: boolean, ctx: any): void;
			};
			ctx: Array<any>; // TODO: do we need this typed?
		}>;

		SvelteDOMInsert: CustomEvent<{
			version: string;
			target: Node;
			node: Node;
		}>;
		SvelteDOMRemove: CustomEvent<{
			version: string;
			node: Node;
		}>;

		SvelteDOMAddEventListener: CustomEvent<SvelteListenerDetail>;
		SvelteDOMRemoveEventListener: CustomEvent<SvelteListenerDetail>;

		SvelteDOMSetAttribute: CustomEvent<{
			version: string;
			node: Element;
			attribute: string;
			value?: string;
		}>;
		SvelteDOMRemoveAttribute: CustomEvent<{
			version: string;
			node: Element;
			attribute: string;
		}>;
		SvelteDOMSetProperty: CustomEvent<{
			version: string;
			node: Element;
			property: string;
			value?: any;
		}>;
		SvelteDOMSetDataset: CustomEvent<{
			version: string;
			node: HTMLElement;
			property: string;
			value?: any;
		}>;
		SvelteDOMSetData: CustomEvent<{
			version: string;
			node: Text;
			data: unknown;
		}>;
	}
}

export {};
