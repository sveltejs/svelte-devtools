/** @type {Map<number, chrome.runtime.Port>} */
const ports = new Map();

chrome.runtime.onConnect.addListener((port) => {
	if (port.sender?.url === chrome.runtime.getURL('/index.html')) {
		// messages are coming from the devtools page and not content script
		port.onMessage.addListener((message, sender) => {
			console.log({ port, message, sender });
			switch (message.type) {
				case 'init': {
					// TODO: reenable profiler
					// chrome.tabs.executeScript(message.tabId, {
					// 	code: message.profilerEnabled
					// 		? 'window.sessionStorage.SvelteDevToolsProfilerEnabled = "true"'
					// 		: 'delete window.sessionStorage.SvelteDevToolsProfilerEnabled',
					// 	runAt: 'document_start',
					// });

					ports.set(message.tabId, sender);

					sender.onDisconnect.addListener(() => {
						ports.delete(message.tabId);

						chrome.tabs.onUpdated.removeListener(attach);
						chrome.tabs.sendMessage(message.tabId, {
							type: 'ext/clear',
							tabId: message.tabId,
						});
					});

					return chrome.tabs.onUpdated.addListener(attach);

					/** @type {Parameters<chrome.tabs.TabUpdatedEvent['addListener']>[0]} */
					function attach(tabId, changed) {
						if (!ports.has(tabId) || changed.status !== 'loading') return;

						chrome.scripting.executeScript({
							target: { tabId },
							// attach script manually instead of declaring through `files`
							// because `detail` in the dispatched custom events is `null`
							func: () => {
								const script = document.createElement('script');
								script.src = chrome.runtime.getURL('/courier.js');
								document.body.appendChild(script);

								window.addEventListener('message', ({ source, data }) => {
									// only accept messages from our application or script
									console.log(source === window, { source, data });
									if (source !== window || data?.source !== 'svelte-devtools') return;
									chrome.runtime.sendMessage(data);
								});

								window.addEventListener('unload', () =>
									chrome.runtime.sendMessage({ type: 'ext/clear' }),
								);

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
								// 		case 'ext/clear':
								// 			delete window.sessionStorage.SvelteDevToolsProfilerEnabled;
								// 			break;
								// 	}
								// 	window.postMessage(message);
								// });
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
		port.disconnect();
	}
});

// relay messages from content script to devtools page
chrome.runtime.onMessage.addListener((message, sender) => {
	const tools = sender.tab?.id && ports.get(sender.tab.id);
	console.log({ message, sender, tools });
	if (tools) tools.postMessage(message);
});
