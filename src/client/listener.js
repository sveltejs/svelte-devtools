export const listeners = {
	/**
	 * @param {SvelteBlockDetail} node
	 * @param {SvelteBlockDetail} [anchor]
	 */
	add(node, anchor) {
		nodes.forEach(({ add }) => add(node, anchor));
	},

	/** @param {SvelteBlockDetail} node */
	update(node) {
		node && nodes.forEach(({ update }) => update(node));
	},

	/** @param {SvelteBlockDetail} node */
	remove(node) {
		nodes.forEach(({ remove }) => remove(node));
	},

	/** @param {any} frame */
	profile(frame) {
		nodes.forEach(({ profile }) => profile(frame));
	},
};

/** @type {typeof listeners[]} */
const nodes = [];

/** @param {typeof nodes[number]} listener */
export function addListener(listener) {
	nodes.push(listener);
}

/** @param {typeof nodes[number]} listener */
export function removeListener(listener) {
	const index = nodes.indexOf(listener);
	if (index === -1) return false;
	return !!nodes.splice(index, 1);
}
