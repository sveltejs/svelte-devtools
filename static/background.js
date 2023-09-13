/** @type {Map<number, chrome.runtime.Port>} */
const ports = new Map();

chrome.runtime.onConnect.addListener((port) => {
	if (port.sender?.url !== chrome.runtime.getURL('/index.html')) {
		console.error(`Unexpected connection from ${port.sender?.url || '<unknown>'}`);
		return port.disconnect();
	}

	port.onMessage.addListener((msg, sender) => {
		if (msg.type === 'init') {
			return setup(msg.tabId, sender, msg.profilerEnabled);
		} else if (msg.type === 'reload') {
			return chrome.tabs.reload(msg.tabId, { bypassCache: true });
		}
		return chrome.tabs.sendMessage(msg.tabId, msg);
	});
});

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

/**
 *
 * @param {number} tabId
 * @param {chrome.runtime.Port} port
 * @param {boolean} profilerEnabled
 */
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

		chrome.tabs.onUpdated.removeListener(attach);
		chrome.tabs.sendMessage(tabId, {
			type: 'clear',
			tabId: tabId,
		});
	});

	chrome.tabs.onUpdated.addListener(attach);
}
