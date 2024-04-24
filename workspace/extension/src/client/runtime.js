/**
 * @param {string} type
 * @param {Record<string, any>} [payload]
 */
export function send(type, payload) {
	window.postMessage({ source: 'svelte-devtools', type, payload });
}
