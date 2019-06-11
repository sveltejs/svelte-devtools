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
  if (msg.type == 'loadInline') loadInlineScripts()

  const tools = toolsPorts.get(port.sender.tab.id)
  if (tools) tools.postMessage(msg)
}

function attachScript(tabId, changed) {
  if (!toolsPorts.has(tabId) || changed.status != 'loading') return

  toolsPorts.get(tabId).postMessage({ type: 'init' })
  chrome.tabs.executeScript(tabId, {
    file: '/content.js',
    runAt: 'document_start'
  })
}

let inlineScripts = []
async function loadInlineScripts() {
  inlineScripts.forEach(o =>
    o.then(script => {
      chrome.tabs.executeScript(script.tabId, {
        code: `
          const tag = Array.from(document.scripts)
            .find(o => o.src == "${script.url}")
          const newTag = document.createElement('script')
          newTag.text = "${script.source
            .replace(/"/g, '\\"')
            .replace(/\\n/g, '\\\\n')
            .replace(/\n/g, '\\n')}"
          if (tag == null)
            document.head.append(newTag)
          else
            tag.parentNode.replaceChild(newTag, tag)
        `,
        runAt: 'document_start'
      })
    })
  )
  inlineScripts = []
}

function queueInlineScript(tabId, url) {
  inlineScripts.push(
    fetch(url)
      .then(o => o.text())
      .then(source => ({ tabId, url, source }))
  )
}

function interceptRequest(details) {
  if (details.method != 'GET' || details.frameId != 0) return

  // Chrome doesn't have response filters. Queue script to be inlined after
  // content script is executed instead
  if (!chrome.webRequest.filterResponseData) {
    queueInlineScript(details.tabId, details.url)
    return { cancel: true }
  }

  return {}
}

function setup(tabId, port) {
  toolsPorts.set(tabId, port)
  port.onDisconnect.addListener(() => {
    toolsPorts.delete(tabId)
    pagePorts.delete(tabId)
    chrome.tabs.onUpdated.removeListener(attachScript)
    chrome.webRequest.onBeforeRequest.removeListener(interceptRequest)
  })

  chrome.tabs.onUpdated.addListener(attachScript)
  chrome.webRequest.onBeforeRequest.addListener(
    interceptRequest,
    { urls: ['*://*/*'], types: ['script'], tabId },
    ['blocking']
  )
}
