const toolsPorts = new Map()
const tabs = new Set()

function onPortClosure(port) {
  const tabId = Number(port.name)
  toolsPorts.delete(tabId)
  tabs.delete(tabId)

  if (tabs.size === 0)
    chrome.tabs.onUpdated.removeListener(attachScript)

  // Inform content script that DevTools page was closed or crashed and content script needs to clean up
  chrome.tabs.sendMessage(tabId, {
    type: 'clear',
    tabId: tabId,
  })
}

function registerPort(port) {
  const tabId = Number(port.name)
  const oldPort = toolsPorts.get(tabId)
  if(oldPort) {
    console.warn('Duplicate port detected! Closing the old one.')
    oldPort.onDisconnect.removeListener(onPortClosure)
    oldPort.disconnect()
  }
  toolsPorts.set(tabId, port)
  port.onDisconnect.addListener(onPortClosure)
}

chrome.runtime.onConnect.addListener(port => {
  if (port.sender.url === chrome.runtime.getURL('/devtools/panel.html')) {
    registerPort(port)
  } else {
    // This is not an expected connection, so we just log an error and close it
    console.error('Unexpected connection. Port ', port)
    port.disconnect();
  }
})

function handleToolsMessage(msg) {
  switch (msg.type) {
    // 'init' and 'reload' messages do not need to be delivered to content script
    case 'init':
      setup(msg.tabId, msg.profilerEnabled)
      break
    case 'reload':
      chrome.tabs.reload(msg.tabId, { bypassCache: true })
      break
    default:
      chrome.tabs.sendMessage(msg.tabId, msg)
      break
  }
}

// Receive messages from content scripts
chrome.runtime.onMessage.addListener((msg, sender) => {
  if (sender.url === chrome.runtime.getURL('/devtools/panel.html')) {
    handleToolsMessage(msg)
  } else {
    handlePageMessage(msg, sender.tab.id)
  }
});

function handlePageMessage(msg, tabId) {
  const tools = toolsPorts.get(tabId)
  if (tools) tools.postMessage(msg)
}

function attachScript(tabId, changed) {
  if (
    !tabs.has(tabId) ||
    changed.status != 'loading' ||
    // #if process.env.TARGET === 'firefox'
    !changed.url
    // #else
    false
    // #endif
  )
    return

  chrome.tabs.executeScript(tabId, {
    file: '/privilegedContent.js',
    runAt: 'document_start',
  })
}

function setup(tabId, profilerEnabled) {
  tabs.add(tabId)

  chrome.tabs.executeScript(tabId, {
    code: profilerEnabled ? `window.sessionStorage.SvelteDevToolsProfilerEnabled = "true"` : 'delete window.sessionStorage.SvelteDevToolsProfilerEnabled',
    runAt: 'document_start',
  })

  chrome.tabs.onUpdated.addListener(attachScript)
}
