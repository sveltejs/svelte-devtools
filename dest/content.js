;(function() {
  const tag = document.createElement('script')
  tag.src = chrome.runtime.getURL('/privilegedContent.js')
  document.body.appendChild(tag)

  const port = chrome.runtime.connect()
  port.onMessage.addListener(window.postMessage.bind(window))
  window.addEventListener(
    'message',
    e => e.source == window && port.postMessage(e.data),
    false
  )
})()
