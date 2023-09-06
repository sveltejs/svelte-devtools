chrome.devtools.panels.create(
	'Svelte',
	chrome.devtools.panels.themeName === 'dark'
		? '/devtools/svelte-logo-dark.svg'
		: '/devtools/svelte-logo-light.svg',
	'/index.html',
	// (panel) => {
	// 	panel.onShown.addListener(() =>
	// 		chrome.devtools.inspectedWindow.eval(
	// 			'if (window.__svelte_devtools_select_element) window.__svelte_devtools_select_element($0)',
	// 			(_, err) => err && console.error(err),
	// 		),
	// 	);
	// },
);
