(() => {
	// @ts-ignore - injected if the website is using svelte
	const [major] = [...(window.__svelte?.v ?? [])];

	document.dispatchEvent(
		new CustomEvent('SvelteDevTools', {
			detail: { type: 'bypass::ext/icon:set', payload: major },
		}),
	);
})();
