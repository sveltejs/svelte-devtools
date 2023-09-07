/**
 * @typedef {{
 * 	id: string;
 * 	type: string;
 * 	tagName: string;
 * }} Node
 */

/** @type {typeof listeners[]} */
const nodes = [];

/** @param {typeof nodes[number]} listener */
export function addNodeListener(listener) {
	nodes.push(listener);
}

/** @param {typeof nodes[number]} listener */
export function removeNodeListener(listener) {
	const index = nodes.indexOf(listener);
	if (index === -1) return false;
	return !!nodes.splice(index, 1);
}

export const listeners = {
	/**
	 * @param {Node} node
	 * @param {Node} anchor
	 */
	add(node, anchor) {
		nodes.forEach(({ add }) => add(node, anchor));
	},

	/** @param {Node} node */
	update(node) {
		node && nodes.forEach(({ update }) => update(node));
	},

	/** @param {Node} node */
	remove(node) {
		nodes.forEach(({ remove }) => remove(node));
	},

	/** @param {any} frame */
	profile(frame) {
		nodes.forEach(({ profile }) => profile(frame));
	},
};
