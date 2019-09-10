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

function handleToolsMessage(msg, port) {
  if (msg.type == 'init') setup(msg.tabId, port)

  const page = pagePorts.get(msg.tabId)
  if (page) page.postMessage(msg)
}

function handlePageMessage(msg, port) {
  const tools = toolsPorts.get(port.sender.tab.id)
  if (tools) tools.postMessage(msg)
}

function attachScript(tabId, changed) {
  if (!toolsPorts.has(tabId) || changed.status != 'loading') return

  toolsPorts.get(tabId).postMessage({ type: 'init' })
  chrome.tabs.executeScript(tabId, {
    file: '/privilegedContent.js',
    runAt: 'document_start'
  })
}

function setup(tabId, port) {
  toolsPorts.set(tabId, port)
  port.onDisconnect.addListener(() => {
    toolsPorts.delete(tabId)
    pagePorts.delete(tabId)
    chrome.tabs.onUpdated.removeListener(attachScript)
  })

  chrome.tabs.onUpdated.addListener(attachScript)
}
