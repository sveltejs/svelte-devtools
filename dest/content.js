;(function() {
  const tag = document.createElement('script')
  tag.src = chrome.runtime.getURL('/privilegedContent.js')
  document.body.appendChild(tag)

  const port = chrome.runtime.connect()
  port.onMessage.addListener(window.postMessage)
  window.addEventListener(
    'message',
    e => e.source == window && port.postMessage(event.data),
    false
  )
})()
