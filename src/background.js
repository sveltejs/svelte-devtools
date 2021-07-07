const toolsPorts = new Map()

chrome.runtime.onConnect.addListener(port => {
  if (port.sender.url == chrome.runtime.getURL('/devtools/panel.html')) {
    port.onMessage.addListener(handleToolsMessage)
  } else {
    // This is not an expected connection, so we just log an error and close it
    console.error('Unexpected connection. Port ', port)
    port.disconnect()
  }
})

function handleToolsMessage(msg, port) {
  switch (msg.type) {
    // 'init' and 'reload' messages do not need to be delivered to content script
    case 'init':
      setup(msg.tabId, port, msg.profilerEnabled)
      break
    case 'reload':
      chrome.tabs.reload(msg.tabId, { bypassCache: true })
      break

    // #if process.env.TARGET !== 'firefox'
    case 'navigation':
      /*
       * Tab might not be ready for script injection yet, so we try to try to execute script
       * right away (in case page is already loading) and then also listen for updated
       * events.
       */
      chrome.tabs.executeScript(msg.tabId, {
        file: '/privilegedContent.js',
        runAt: 'document_start',
      })
      chrome.tabs.onUpdated.addListener(attachScript)
      break
    // #endif

    default:
      chrome.tabs.sendMessage(msg.tabId, msg)
      break
  }
}

// Receive messages from content scripts
chrome.runtime.onMessage.addListener((msg, sender) =>
  handlePageMessage(msg, sender.tab.id)
)

function handlePageMessage(msg, tabId) {
  switch (msg.type) {
    case 'ready':
      // #if process.env.TARGET !== 'firefox'
      chrome.tabs.onUpdated.removeListener(attachScript)
      // #endif
      break

    default: {
      const tools = toolsPorts.get(tabId)
      if (tools) tools.postMessage(msg)
      break
    }
  }
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
    file: '/privilegedContent.js',
    runAt: 'document_start',
  })
}

function setup(tabId, port, profilerEnabled) {
  chrome.tabs.executeScript(tabId, {
    code: profilerEnabled
      ? 'window.sessionStorage.SvelteDevToolsProfilerEnabled = "true"'
      : 'delete window.sessionStorage.SvelteDevToolsProfilerEnabled',
    runAt: 'document_start',
  })

  toolsPorts.set(tabId, port)

  port.onDisconnect.addListener(() => {
    toolsPorts.delete(tabId)
    chrome.tabs.onUpdated.removeListener(attachScript)
    // Inform content script that it background closed and it needs to clean up
    chrome.tabs.sendMessage(tabId, {
      type: 'clear',
      tabId: tabId,
    })
  })

  // #if process.env.TARGET === 'firefox'
  chrome.tabs.onUpdated.addListener(attachScript)
  // #endif
}
