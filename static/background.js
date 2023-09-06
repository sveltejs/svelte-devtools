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

						chrome.scripting.executeScript({
							target: { tabId },
							// attach script manually instead of declaring through `files`
							// because `detail` in the dispatched custom events is `null`
							func: () => {
								const script = document.createElement('script');
								script.src = chrome.runtime.getURL('/courier.js');
								document.body.appendChild(script);

								// if (window.sessionStorage.SvelteDevToolsProfilerEnabled === 'true')
								// 	window.tag.text = window.tag.text.replace(
								// 		'let profilerEnabled = false;',
								// 		'$&\\nstartProfiler();',
								// 	);

								// chrome.runtime.onMessage.addListener((message, sender) => {
								// 	const fromBackground = sender.id === chrome.runtime.id;
								// 	if (!fromBackground) {
								// 		console.error('Message from unexpected sender', sender, message);
								// 		return;
								// 	}
								// 	switch (message.type) {
								// 		case 'startProfiler':
								// 			window.sessionStorage.SvelteDevToolsProfilerEnabled = 'true';
								// 			break;
								// 		case 'stopProfiler':
								// 		case 'clear':
								// 			delete window.sessionStorage.SvelteDevToolsProfilerEnabled;
								// 			break;
								// 	}
								// 	window.postMessage(message);
								// });
								// window.addEventListener(
								// 	'message',
								// 	(e) => e.source === window && chrome.runtime.sendMessage(e.data),
								// );
								// window.addEventListener('unload', () =>
								// 	chrome.runtime.sendMessage({ type: 'clear' }),
								// );
							},
						});
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
