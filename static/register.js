chrome.devtools.panels.create(
	'Svelte',
	chrome.devtools.panels.themeName === 'dark'
		? '/icons/svelte-logo-dark.svg'
		: '/icons/svelte-logo-light.svg',
	'/panel.html',
	// (panel) => {
	// 	panel.onShown.addListener(() =>
	// 		chrome.devtools.inspectedWindow.eval(
	// 			'if (window.__svelte_devtools_select_element) window.__svelte_devtools_select_element($0)',
	// 			(_, err) => err && console.error(err),
	// 		),
	// 	);
	// },
);
