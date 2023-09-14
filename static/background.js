/** @type {Map<number, chrome.runtime.Port>} */
const ports = new Map();

chrome.runtime.onConnect.addListener((port) => {
	if (port.sender?.url !== chrome.runtime.getURL('/index.html')) {
		console.error(`Unexpected connection from ${port.sender?.url || '<unknown>'}`);
		return port.disconnect();
	}

	// messages are from the devtools page and not content script (courier.js)
	port.onMessage.addListener((message, sender) => {
		if (message.type === 'init') {
			return setup(message.tabId, sender);
		} else if (message.type === 'reload') {
			return chrome.tabs.reload(message.tabId, { bypassCache: true });
		}
		// relay messages from devtools page to `chrome.scripting`
		return chrome.tabs.sendMessage(message.tabId, message);
	});
});

// relay messages from `chrome.scripting` to devtools page
chrome.runtime.onMessage.addListener((msg, sender) => {
	if (sender.id !== chrome.runtime.id) return; // unexpected sender
	const port = sender.tab?.id && ports.get(sender.tab.id);
	if (port) port.postMessage(msg);
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

			chrome.runtime.onMessage.addListener((message, sender) => {
				if (sender.id !== chrome.runtime.id) return; // unexpected sender
				window.postMessage(message); // relay to content script (courier.js)
			});

			window.addEventListener('message', ({ source, data }) => {
				// only accept messages from our application or script
				if (source === window && data?.source === 'svelte-devtools') {
					chrome.runtime.sendMessage(data);
				}
			});

			window.addEventListener('unload', () => {
				chrome.runtime.sendMessage({ type: 'ext/clear' });
			});
		},
	});
}

/**
 * @param {number} tabId
 * @param {chrome.runtime.Port} sender
 */
function setup(tabId, sender) {
	// chrome.tabs.executeScript(tabId, {
	// 	code: profilerEnabled
	// 		? `window.sessionStorage.SvelteDevToolsProfilerEnabled = "true"`
	// 		: 'delete window.sessionStorage.SvelteDevToolsProfilerEnabled',
	// 	runAt: 'document_start',
	// });

	ports.set(tabId, sender);

	sender.onDisconnect.addListener(() => {
		ports.delete(tabId);

		chrome.tabs.onUpdated.removeListener(attach);
		chrome.tabs.sendMessage(tabId, {
			type: 'clear',
			tabId: tabId,
		});
	});

	chrome.tabs.onUpdated.addListener(attach);
}
