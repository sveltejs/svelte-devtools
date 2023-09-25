chrome.devtools.panels.create(
	'Svelte',
	chrome.devtools.panels.themeName === 'dark'
		? '/icons/svelte-logo-dark.svg'
		: '/icons/svelte-logo-light.svg',
	'/index.html',
	// (panel) => {
	// 	panel.onShown.addListener((win) =>
	// 		chrome.devtools.inspectedWindow.eval('$0', (payload) =>
	// 			win.postMessage({ source: 'svelte-devtools', type: 'ext/inspect', payload }),
	// 		),
	// 	);
	// },
);
