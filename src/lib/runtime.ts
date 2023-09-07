export const background = chrome.runtime.connect({
	name: 'svelte-devtools:panel',
});

const source = 'svelte-devtools';
const tabId = chrome.devtools.inspectedWindow.tabId;

background.postMessage({ source, type: 'init', tabId });

export const ext = {
	reload() {
		background.postMessage({ source, type: 'ext.reload', tabId });
	},
};

export const site = {
	refresh() {
		background.postMessage({ source, type: 'page.refresh', tabId });
	},
	startPicker() {
		background.postMessage({ source, type: 'startPicker', tabId });
	},
	stopPicker() {
		background.postMessage({ source, type: 'stopPicker', tabId });
	},
};
