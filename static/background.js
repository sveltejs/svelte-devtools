/** @type {Map<number, chrome.runtime.Port>} */
const ports = new Map();

chrome.runtime.onConnect.addListener((port) => {
	if (port.sender?.url === chrome.runtime.getURL('/index.html')) {
		port.onMessage.addListener(handleToolsMessage);
	} else {
		// This is not an expected connection, so we just log an error and close it
		console.error('Unexpected connection. Port ', port);
		port.disconnect();
	}
});

/** @type {Parameters<chrome.runtime.Port['onMessage']['addListener']>[0]} */
function handleToolsMessage(msg, port) {
	switch (msg.type) {
		case 'init': {
			chrome.tabs.executeScript(msg.tabId, {
				code: msg.profilerEnabled
					? `window.sessionStorage.SvelteDevToolsProfilerEnabled = "true"`
					: 'delete window.sessionStorage.SvelteDevToolsProfilerEnabled',
				runAt: 'document_start',
			});

			ports.set(msg.tabId, port);

			port.onDisconnect.addListener(() => {
				ports.delete(msg.tabId);

				chrome.tabs.onUpdated.removeListener(attach);
				chrome.tabs.sendMessage(msg.tabId, {
					type: 'clear',
					tabId: msg.tabId,
				});
			});

			return chrome.tabs.onUpdated.addListener(attach);
		}
		case 'reload':
			return void chrome.tabs.reload(msg.tabId, { bypassCache: true });
		default:
			// relay messages from devtools page to content scripts
			return void chrome.tabs.sendMessage(msg.tabId, msg);
	}
}

// relay messages from content scripts to devtools page
chrome.runtime.onMessage.addListener((msg, sender) => {
	const port = sender.tab?.id && ports.get(sender.tab.id);
	if (port) port.postMessage(msg);
});

/** @type {Parameters<chrome.tabs.TabUpdatedEvent['addListener']>[0]} */
function attach(tabId, changed) {
	if (!ports.has(tabId) || changed.status !== 'loading') return;

	chrome.tabs.executeScript(tabId, {
		file: '/courier.js',
		runAt: 'document_start',
	});
}
