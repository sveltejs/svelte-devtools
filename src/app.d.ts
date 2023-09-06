type Modifiers = Array<
	'capture' | 'preventDefault' | 'stopPropagation' | 'stopImmediatePropagation'
>;

type SvelteDevListener = CustomEvent<{
	version: string;
	node: Node;
	event: string;
	handler: EventListenerOrEventListenerObject;
	modifiers: Modifiers;
}>;

declare global {
	interface DocumentEventMap {
		SvelteDOMInsert: CustomEvent<{
			version: string;
			target: Node;
			node: Node;
		}>;
		SvelteDOMRemove: CustomEvent<{
			version: string;
			node: Node;
		}>;

		SvelteDOMAddEventListener: SvelteDevListener;
		SvelteDOMRemoveEventListener: SvelteDevListener;

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
