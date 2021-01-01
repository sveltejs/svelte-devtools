const toolsPorts = new Map()
const pagePorts = new Map()

chrome.runtime.onConnect.addListener(port => {
  if (port.sender.url == chrome.runtime.getURL('/devtools/panel.html')) {
    port.onMessage.addListener(handleToolsMessage)
  } else {
    port.onMessage.addListener(handlePageMessage)
    port.onDisconnect.addListener(port => pagePorts.delete(port.sender.tab.id))
    pagePorts.set(port.sender.tab.id, port)
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
      const page = pagePorts.get(msg.tabId)
      if (page) page.postMessage(msg)
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

function handlePageMessage(msg, port) {
  const tools = toolsPorts.get(port.sender.tab.id)
  if (tools) tools.postMessage(msg)
}

function attachScript(tabId, changed) {
  if (
    !toolsPorts.has(tabId) ||
    changed.status != 'loading' ||
    // #if process.env.TARGET === 'firefox'
    !changed.url
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
    pagePorts.delete(tabId)
    const i = profilerEnabledList.indexOf(tabId)
    if (i != -1) profilerEnabledList.slice(i, 1)
    chrome.tabs.onUpdated.removeListener(attachScript)
  })

  chrome.tabs.onUpdated.addListener(attachScript)
}
