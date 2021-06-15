const toolsPorts = new Map()

chrome.runtime.onConnect.addListener(port => {
  if (port.sender.url == chrome.runtime.getURL('/devtools/panel.html')) {
    port.onMessage.addListener(handleToolsMessage)
  } else {
    // This is not an expected connection, so we just log an error and close it
    console.error('Unexpected connection. Port ', port)
    port.disconnect();
  }
})

const profilerEnabledList = []

function handleToolsMessage(msg, port) {
  switch (msg.type) {
    case 'init':
      setup(msg.tabId, port)
      break
    case 'reload':
      chrome.tabs.reload(msg.tabId, { bypassCache: true })
      break
    default:
      chrome.tabs.sendMessage(msg.tabId, msg)
      break
  }

  switch (msg.type) {
    case 'startProfiler':
      profilerEnabledList.push(msg.tabId)
      break
    case 'startProfiler':
      const i = profilerEnabledList.indexOf(msg.tabId)
      if (i != -1) profilerEnabledList.slice(i, 1)
      break
  }
}

// Receive messages from content scripts
chrome.runtime.onMessage.addListener((msg, sender) =>
  handlePageMessage(msg, sender.tab.id)
);

function handlePageMessage(msg, tabId) {
  const tools = toolsPorts.get(tabId)
  if (tools) tools.postMessage(msg)
}

function attachScript(tabId, changed) {
  if (
    !toolsPorts.has(tabId) ||
    changed.status != 'loading' ||
    // #if process.env.TARGET === 'firefox'
    !changed.url
    // #else
    false
    // #endif
  )
    return

  chrome.tabs.executeScript(tabId, {
    code: `window.profilerEnabled = ${profilerEnabledList.includes(tabId)}`,
    runAt: 'document_start',
  })
  chrome.tabs.executeScript(tabId, {
    file: '/privilegedContent.js',
    runAt: 'document_start',
  })
}

function setup(tabId, port) {
  toolsPorts.set(tabId, port)
  port.onDisconnect.addListener(() => {
    toolsPorts.delete(tabId)
    const i = profilerEnabledList.indexOf(tabId)
    if (i != -1) profilerEnabledList.slice(i, 1)
    chrome.tabs.onUpdated.removeListener(attachScript)
  })

  chrome.tabs.onUpdated.addListener(attachScript)
}
