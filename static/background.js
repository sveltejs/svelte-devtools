const ports = new Map();

chrome.runtime.onConnect.addListener((port) => {
	console.log(port.sender?.url, chrome.runtime.getURL('/index.html'));
	if (port.sender?.url === chrome.runtime.getURL('/index.html')) {
		port.onMessage.addListener((message, port) => {
			// 'init' and 'reload' messages do not need to be delivered to content script
			switch (message.type) {
				case 'init': {
					// TODO: reenable profiler
					// chrome.tabs.executeScript(message.tabId, {
					// 	code: message.profilerEnabled
					// 		? 'window.sessionStorage.SvelteDevToolsProfilerEnabled = "true"'
					// 		: 'delete window.sessionStorage.SvelteDevToolsProfilerEnabled',
					// 	runAt: 'document_start',
					// });

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
						// TODO: window does not exist in service worker
						// const firefox = !window.chrome && !changed.url;
						if (!ports.has(tabId) || changed.status !== 'loading' /** || firefox */) return;

						// chrome.offscreen.createDocument({
						// reasons:[]
						// });

						chrome.scripting.executeScript({
							target: { tabId },
							files: ['/privileged-content.js'],
						});

						// TODO: figure out the replacement
						// chrome.scripting.registerContentScripts([
						// 	{ id: `${tabId}`, js: ['/privileged-content.js'], runAt: 'document_start' },
						// ]);
					}
				}

				case 'ext.reload':
					return chrome.runtime.reload();
				case 'page.refresh':
					return chrome.tabs.reload(message.tabId, { bypassCache: true });
				default:
					return chrome.tabs.sendMessage(message.tabId, message);
			}
		});
	} else {
		// This is not an expected connection, so we just log an error and close it
		console.error(`Unexpected connection. Port from ${port.sender?.url}`);
		port.disconnect();
	}
});

// Receive messages from content scripts
chrome.runtime.onMessage.addListener((message, sender) => {
	const tools = ports.get(sender.tab?.id);
	if (tools) tools.postMessage(message);
});
