export const port = chrome.runtime.connect();

/* Include all relevant content script settings in
 * message itself to avoid extra async queries
 */
port.postMessage({
	type: 'init',
	profilerEnabled: false, // TODO: read from options
	tabId: chrome.devtools.inspectedWindow.tabId,
});

export function reload() {
	port.postMessage({
		type: 'reload',
		tabId: chrome.devtools.inspectedWindow.tabId,
	});
}

export function startPicker() {
	port.postMessage({
		type: 'startPicker',
		tabId: chrome.devtools.inspectedWindow.tabId,
	});
}

export function stopPicker() {
	port.postMessage({
		type: 'stopPicker',
		tabId: chrome.devtools.inspectedWindow.tabId,
	});
}
