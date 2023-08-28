// -- TODO: remove file --

export default [
	// TODO: generate through vite plugin
	{
		input: 'src/client/index.js',
		output: {
			file: 'dest/privilegedContent.js',
			name: 'SvelteDevtools',
			format: 'iife',
			banner: `if (!window.tag) {
  window.tag = document.createElement('script')
  window.tag.text = \``,
			footer: `\`
  if (window.sessionStorage.SvelteDevToolsProfilerEnabled === "true") window.tag.text = window.tag.text.replace('let profilerEnabled = false;', '\$&\\nstartProfiler();')
  document.children[0].append(window.tag)
  const sendMessage = chrome.runtime.sendMessage
  const postMessage = window.postMessage.bind(window)
  chrome.runtime.onMessage.addListener((message, sender) => {
    const fromBackground = sender && sender.id === chrome.runtime.id
    if (!fromBackground) {
      console.error('Message from unexpected sender', sender, message)
      return
    }
    switch (message.type) {
      case 'startProfiler':
        window.sessionStorage.SvelteDevToolsProfilerEnabled = "true"
        break
      case 'stopProfiler':
        // fallthrough
      case 'clear':
        delete window.sessionStorage.SvelteDevToolsProfilerEnabled
        break
    }
    postMessage(message)
  })
  window.addEventListener(
    'message',
    e => e.source == window && sendMessage(e.data),
    false
  )
  window.addEventListener('unload', () => sendMessage({ type: 'clear' }))
}`,
		},
	},
];
