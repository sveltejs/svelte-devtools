export const port = chrome.runtime.connect();

const tabId = chrome.devtools.inspectedWindow.tabId;

port.postMessage({ type: 'init', tabId });

export const ext = {
	reload() {
		port.postMessage({ type: 'ext.reload', tabId });
	},
};

export const site = {
	refresh() {
		port.postMessage({ type: 'page.refresh', tabId });
	},
	startPicker() {
		port.postMessage({ type: 'startPicker', tabId });
	},
	stopPicker() {
		port.postMessage({ type: 'stopPicker', tabId });
	},
};
