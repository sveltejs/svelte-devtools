import { highlight } from './highlight.js';
import { send } from './runtime.js';
import { index as v4 } from './svelte-4.js';
import { serialize } from './utils.js';

// @ts-ignore - for the app to call with `eval`
window['#SvelteDevTools'] = {
	/**
	 * @param {string} id
	 * @param {string} key
	 * @param {any} value
	 */
	inject(id, key, value) {
		const { detail: component } = v4.map.get(id) || {};
		component && component.$inject_state({ [key]: value });
	},
};

const previous = {
	/** @type {HTMLElement | null} */
	target: null,
	style: {
		cursor: '',
		background: '',
		outline: '',
	},

	clear() {
		if (this.target) {
			for (const key in this.style) {
				// @ts-expect-error - trust me TS
				this.target.style[key] = this.style[key];
			}
		}
		this.target = null;
	},
};

const inspect = {
	/** @param {MouseEvent} event  */
	handle({ target }) {
		const same = previous.target && previous.target === target;
		const html = target instanceof HTMLElement;
		if (same || !html) return;

		if (previous.target) previous.clear();
		previous.target = target;
		previous.style = {
			cursor: target.style.cursor,
			background: target.style.background,
			outline: target.style.outline,
		};
		target.style.cursor = 'pointer';
		target.style.background = 'rgba(0, 136, 204, 0.2)';
		target.style.outline = '1px dashed rgb(0, 136, 204)';
	},
	/** @param {MouseEvent} event  */
	click(event) {
		event.preventDefault();
		document.removeEventListener('mousemove', inspect.handle, true);
		const node = v4.map.get(/** @type {Node} */ (event.target));
		if (node) send('bridge::ext/inspect', { node: serialize(node) });
		previous.clear();
	},
};

window.addEventListener('message', ({ data, source }) => {
	// only accept messages from our application or script
	if (source !== window || data?.source !== 'svelte-devtools') return;

	if (data.type === 'bridge::ext/select') {
		const node = v4.map.get(data.payload);
		// @ts-expect-error - saved for `devtools.inspect()`
		if (node) window.$n = node.detail;
	} else if (data.type === 'bridge::ext/highlight') {
		const node = v4.map.get(data.payload);
		return highlight(node);
	} else if (data.type === 'bridge::ext/inspect') {
		switch (data.payload) {
			case 'start': {
				document.addEventListener('mousemove', inspect.handle, true);
				document.addEventListener('click', inspect.click, {
					capture: true,
					once: true,
				});
				break;
			}
			default: {
				document.removeEventListener('mousemove', inspect.handle, true);
				document.removeEventListener('click', inspect.click, true);
				previous.clear();
			}
		}
	}
});
