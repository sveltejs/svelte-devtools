const ports = new Map();

chrome.runtime.onConnect.addListener((port) => {
	if (port.sender?.url === chrome.runtime.getURL('/index.html')) {
		port.onMessage.addListener((message, port) => {
			// 'init' and 'reload' messages do not need to be delivered to content script
			switch (message.type) {
				case 'init': {
					chrome.tabs.executeScript(message.tabId, {
						code: message.profilerEnabled
							? 'window.sessionStorage.SvelteDevToolsProfilerEnabled = "true"'
							: 'delete window.sessionStorage.SvelteDevToolsProfilerEnabled',
						runAt: 'document_start',
					});

					ports.set(message.tabId, port);

					port.onDisconnect.addListener(() => {
						ports.delete(message.tabId);

						chrome.tabs.onUpdated.removeListener(attach);
						chrome.tabs.sendMessage(message.tabId, {
							// Inform content script that it needs to clean up
							type: 'clear',
							tabId: message.tabId,
						});
					});

					return chrome.tabs.onUpdated.addListener(attach);

					/** @type {Parameters<chrome.tabs.TabUpdatedEvent['addListener']>[0]} */
					function attach(tabId, changed) {
						const firefox = !window.chrome && !changed.url;
						if (!ports.has(tabId) || changed.status !== 'loading' || firefox) return;
						chrome.tabs.executeScript(tabId, {
							file: '/privilegedContent.js',
							runAt: 'document_start',
						});
					}
				}
				case 'reload':
					return chrome.tabs.reload(message.tabId, { bypassCache: true });
				default:
					return chrome.tabs.sendMessage(message.tabId, message);
			}
		});
	} else {
		// This is not an expected connection, so we just log an error and close it
		console.error(`Unexpected connection. Port ${port}`);
		port.disconnect();
	}
});

// Receive messages from content scripts
chrome.runtime.onMessage.addListener((message, sender) => {
	const tools = ports.get(sender.tab?.id);
	if (tools) tools.postMessage(message);
});
