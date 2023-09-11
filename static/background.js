/** @type {Map<number, chrome.runtime.Port>} */
const ports = new Map();

chrome.runtime.onConnect.addListener((port) => {
	if (port.sender?.url === chrome.runtime.getURL('/index.html')) {
		// messages are from the devtools page and not content script (courier.js)
		port.onMessage.addListener((message, sender) => {
			switch (message.type) {
				case 'ext/init': {
					ports.set(message.tabId, sender);

					port.onDisconnect.addListener(() => {
						ports.delete(message.tabId);

						chrome.tabs.onUpdated.removeListener(attach);
						chrome.tabs.sendMessage(message.tabId, {
							type: 'ext/clear',
							tabId: message.tabId,
						});
					});

					return chrome.tabs.onUpdated.addListener(attach);
				}

				case 'ext/reload':
					return chrome.runtime.reload();
				case 'page/refresh':
					return chrome.tabs.reload(message.tabId, { bypassCache: true });
				default:
					// relay messages from devtools page to `chrome.scripting`
					return chrome.tabs.sendMessage(message.tabId, message);
			}
		});
	} else {
		port.disconnect();
	}
});

// relay messages from `chrome.scripting` to devtools page
chrome.runtime.onMessage.addListener((message, sender) => {
	if (sender.id !== chrome.runtime.id) return; // unexpected sender
	const port = sender.tab?.id && ports.get(sender.tab.id);
	if (port) port.postMessage(message);
});

/** @type {Parameters<chrome.tabs.TabUpdatedEvent['addListener']>[0]} */
function attach(tabId, changed) {
	if (!ports.has(tabId) || changed.status !== 'loading') return;

	chrome.scripting.executeScript({
		target: { tabId },

		// no lexical context, `func` is serialized and deserialized.
		// a limbo world where both `chrome` and `window` are defined
		// with many unexpected and out of the ordinary behaviors, do
		// minimal work here and delegate to `courier.js` in the page.
		func: () => {
			const source = chrome.runtime.getURL('/courier.js');
			if (document.querySelector(`script[src="${source}"]`)) return;

			// attach script manually instead of declaring through `files`
			// because `detail` in the dispatched custom events is `null`
			const script = document.createElement('script');
			script.setAttribute('src', source);
			document.body.appendChild(script);

			// // TODO: reenable profiler
			// if (message.type === 'ext/profiler' && message.payload) {
			// 	// start profiler
			// }

			chrome.runtime.onMessage.addListener((message, sender) => {
				if (sender.id !== chrome.runtime.id) return; // unexpected sender
				window.postMessage(message); // relay to content script (courier.js)

				// switch (message.type) {
				// 	case 'startProfiler':
				// 		window.sessionStorage.SvelteDevToolsProfilerEnabled = 'true';
				// 		break;
				// 	case 'stopProfiler':
				// 	case 'ext/clear':
				// 		delete window.sessionStorage.SvelteDevToolsProfilerEnabled;
				// 		break;
				// }
			});

			window.addEventListener('message', ({ source, data }) => {
				// only accept messages from our application or script
				if (source === window && data?.source === 'svelte-devtools') {
					chrome.runtime.sendMessage(data);
				}
			});

			window.addEventListener('unload', () => chrome.runtime.sendMessage({ type: 'ext/clear' }));
		},
	});
}
