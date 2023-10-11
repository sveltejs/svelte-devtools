chrome.devtools.panels.create(
	'Svelte',
	`icons/svelte-${chrome.devtools.panels.themeName}.svg`,
	'index.html',
	// (panel) => {
	// 	panel.onShown.addListener((win) =>
	// 		chrome.devtools.inspectedWindow.eval('$0', (payload) =>
	// 			win.postMessage({ source: 'svelte-devtools', type: 'ext/inspect', payload }),
	// 		),
	// 	);
	// },
);
