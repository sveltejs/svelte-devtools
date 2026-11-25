/** @type {Map<number, chrome.runtime.Port>} */
const ports = new Map();

chrome.runtime.onConnect.addListener((port) => {
	if (port.sender?.url !== chrome.runtime.getURL('/index.html')) {
		console.error(`Unexpected connection from ${port.sender?.url || '<unknown>'}`);
		return port.disconnect();
	}

	// messages are from the devtools page and not content script (courier.js)
	port.onMessage.addListener((message, sender) => {
		switch (message.type) {
			case 'bypass::ext/init': {
				ports.set(message.tabId, sender);
				if (!chrome.tabs.onUpdated.hasListener(courier)) {
					chrome.tabs.onUpdated.addListener(courier);
				}
				sensor(message.tabId);
				break;
			}
			case 'bypass::ext/page->refresh': {
				chrome.tabs.reload(message.tabId, { bypassCache: true });
				break;
			}

			default: // relay messages from devtools to tab
				chrome.tabs.sendMessage(message.tabId, message);
		}
	});

	port.onDisconnect.addListener((disconnected) => {
		ports.delete(+disconnected.name);

		if (ports.size === 0) {
			chrome.tabs.onUpdated.removeListener(courier);
		}
	});
});

// relay messages from `chrome.scripting` to devtools page
chrome.runtime.onMessage.addListener((message, sender) => {
	if (sender.id !== chrome.runtime.id) return; // unexpected sender

	if (message.type === 'bridge::ext/svelte_version:set' && sender.tab?.id) {
		const selected = message.payload ? 'default' : 'disabled';
		const icons = [16, 24, 48, 96, 128].map((s) => [s, `icons/${selected}-${s}.png`]);
		chrome.action.setIcon({ 
			path: Object.fromEntries(icons),
			tabId: sender.tab.id 
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

		// ensures we're listening to the events before they're dispatched
		injectImmediately: true,

		// no lexical context, `func` is serialized and deserialized.
		// a limbo world where both `chrome` and `window` are defined
		// with many unexpected and out of the ordinary behaviors, do
		// minimal work here and delegate to `courier.js` in the page.
		// only a subset of APIs are available in this `chrome` limbo
		//	- chrome.csi->f()
		//	- chrome.dom.{openOrClosedShadowRoot->f()}
		//	- chrome.extension.{ViewType, inIncognitoContext}
		//	- chrome.i18n
		//	- chrome.runtime
		func: () => {
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
				chrome.runtime.sendMessage({ type: 'bridge::ext/clear' });
			});
		},
	});
}

chrome.tabs.onActivated.addListener(({ tabId }) => sensor(tabId));
chrome.tabs.onUpdated.addListener(
	(tabId, changed) => changed.status === 'complete' && sensor(tabId),
);

/** @param {number} tabId */
async function sensor(tabId) {
	try {
		// add SvelteDevTools event listener
		await chrome.scripting.executeScript({
			target: { tabId },
			func: () => {
				document.addEventListener('SvelteDevTools', ({ detail }) => {
					chrome.runtime.sendMessage(detail);
				});
			},
		});
		// Small delay to let Svelte load
		await new Promise(resolve => setTimeout(resolve, 100));
		// capture data to send to listener
		await chrome.scripting.executeScript({
			target: { tabId },
			world: 'MAIN',
			func: () => {
				// @ts-ignore - injected if the website is using svelte
				const [major] = [...(window.__svelte?.v ?? [])].map(v => parseInt(v));

				document.dispatchEvent(
					new CustomEvent('SvelteDevTools', {
						detail: { type: 'bridge::ext/svelte_version:set', payload: major },
					}),
				);
			},
		});
	} catch {
		// for internal URLs like `chrome://` or `edge://` and extension gallery
		// https://chromium.googlesource.com/chromium/src/+/ee77a52baa1f8a98d15f9749996f90e9d3200f2d/chrome/common/extensions/chrome_extensions_client.cc#131
		const icons = [16, 24, 48, 96, 128].map((s) => [s, `icons/disabled-${s}.png`]);
		chrome.action.setIcon({ 
			path: Object.fromEntries(icons),
			tabId: tabId 
		});
	}
}
