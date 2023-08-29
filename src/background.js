const ports = new Map();

chrome.runtime.onConnect.addListener((port) => {
	if (port.sender.url == chrome.runtime.getURL('/devtools/panel.html')) {
		port.onMessage.addListener(handleToolsMessage);
	} else {
		// This is not an expected connection, so we just log an error and close it
		console.error('Unexpected connection. Port ', port);
		port.disconnect();
	}
});

function handleToolsMessage(msg, port) {
	switch (msg.type) {
		// 'init' and 'reload' messages do not need to be delivered to content script
		case 'init':
			setup(msg.tabId, port, msg.profilerEnabled);
			break;
		case 'reload':
			chrome.tabs.reload(msg.tabId, { bypassCache: true });
			break;
		default:
			chrome.tabs.sendMessage(msg.tabId, msg);
			break;
	}
}

// Receive messages from content scripts
chrome.runtime.onMessage.addListener((msg, sender) => handlePageMessage(msg, sender.tab.id));

function handlePageMessage(msg, tabId) {
	const tools = ports.get(tabId);
	if (tools) tools.postMessage(msg);
}

function attachScript(tabId, changed) {
	const firefox = !window.chrome && !changed.url;
	if (!ports.has(tabId) || changed.status !== 'loading' || firefox) return;
	chrome.tabs.executeScript(tabId, {
		file: '/privilegedContent.js',
		runAt: 'document_start',
	});
}

function setup(tabId, port, profilerEnabled) {
	chrome.tabs.executeScript(tabId, {
		code: profilerEnabled
			? `window.sessionStorage.SvelteDevToolsProfilerEnabled = "true"`
			: 'delete window.sessionStorage.SvelteDevToolsProfilerEnabled',
		runAt: 'document_start',
	});

	ports.set(tabId, port);

	port.onDisconnect.addListener(() => {
		ports.delete(tabId);
		chrome.tabs.onUpdated.removeListener(attachScript);
		// Inform content script that it background closed and it needs to clean up
		chrome.tabs.sendMessage(tabId, {
			type: 'clear',
			tabId: tabId,
		});
	});

	chrome.tabs.onUpdated.addListener(attachScript);
}
