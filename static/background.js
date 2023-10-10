/** @type {Map<number, chrome.runtime.Port>} */
const ports = new Map();

chrome.runtime.onConnect.addListener((port) => {
	if (port.sender?.url !== chrome.runtime.getURL('/index.html')) {
		console.error(`Unexpected connection from ${port.sender?.url || '<unknown>'}`);
		return port.disconnect();
	}

	// messages are from the devtools page and not content script (courier.js)
	port.onMessage.addListener((message, sender) => {
		if (message.type === 'ext/init') {
			ports.set(message.tabId, sender);

			port.onDisconnect.addListener(() => {
				ports.delete(message.tabId);

				if (ports.size === 0) {
					chrome.tabs.onUpdated.removeListener(courier);
				}
			});

			return chrome.tabs.onUpdated.addListener(courier);
		} else if (message.type === 'ext/reload') {
			return chrome.runtime.reload();
		} else if (message.type === 'page/refresh') {
			return chrome.tabs.reload(message.tabId, { bypassCache: true });
		}

		// relay messages from devtools page to `chrome.scripting`
		return chrome.tabs.sendMessage(message.tabId, message);
	});
});

// relay messages from `chrome.scripting` to devtools page
chrome.runtime.onMessage.addListener((message, sender) => {
	if (sender.id !== chrome.runtime.id) return; // unexpected sender

	if (message.type === 'ext/icon:set') {
		const selected = message.payload ? 'default' : 'disabled';
		return chrome.action.setIcon({
			path: {
				16: `icons/${selected}-16.png`,
				24: `icons/${selected}-24.png`,
				48: `icons/${selected}-48.png`,
				96: `icons/${selected}-96.png`,
				128: `icons/${selected}-128.png`,
			},
		});
	}

	const port = sender.tab?.id && ports.get(sender.tab.id);
	if (port) return port.postMessage(message);
});

/** @type {Parameters<chrome.tabs.TabUpdatedEvent['addListener']>[0]} */
function courier(tabId, changed) {
	if (!ports.has(tabId) || changed.status !== 'loading') return;

	chrome.scripting.executeScript({
		target: { tabId },
		injectImmediately: true,

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
			document.documentElement.appendChild(script);

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

			window.addEventListener('unload', () => {
				chrome.runtime.sendMessage({ type: 'ext/clear' });
			});
		},
	});
}

chrome.tabs.onActivated.addListener(({ tabId }) => sensor(tabId));
chrome.tabs.onUpdated.addListener(
	(tabId, changed) => changed.status === 'loading' && sensor(tabId),
);

/** @param {number} tabId */
async function sensor(tabId) {
	const { url } = await chrome.tabs.get(tabId);
	if (url) {
		// only execute script for valid tabs with URLs
		chrome.scripting.executeScript({
			target: { tabId },

			func: () => {
				const source = chrome.runtime.getURL('/sensor.js');
				document.querySelector(`script[src="${source}"]`)?.remove();
				const script = document.createElement('script');
				script.setAttribute('src', source);
				document.documentElement.appendChild(script);

				document.addEventListener('SvelteDevTools', ({ detail }) => {
					chrome.runtime.sendMessage(detail);
				});
			},
		});
	} else {
		// for internal pages like `chrome://extensions/`
		chrome.action.setIcon({
			path: {
				16: 'icons/disabled-16.png',
				24: 'icons/disabled-24.png',
				48: 'icons/disabled-48.png',
				96: 'icons/disabled-96.png',
				128: 'icons/disabled-128.png',
			},
		});
	}
}
