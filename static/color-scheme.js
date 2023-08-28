if (chrome.devtools.panels.themeName === 'dark') {
	document.body.classList.add('dark');
} else {
	document.body.classList.remove('dark');
}

if (chrome.devtools.panels.onThemeChanged) {
	chrome.devtools.panels.onThemeChanged.addListener(() => {
		if (chrome.devtools.panels.themeName === 'dark') {
			document.body.classList.add('dark');
		} else {
			document.body.classList.remove('dark');
		}
	});
}
