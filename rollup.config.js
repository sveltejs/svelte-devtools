import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import css from 'rollup-plugin-css-only';

export default [
	{
		input: 'src/index.js',
		external: ['chrome'],
		output: {
			file: 'dest/devtools/bundle.js',
			name: 'App',
			format: 'iife',
			globals: {
				chrome: 'chrome',
			},
		},
		plugins: [
			svelte({
				preprocess: {
					markup: (input) => {
						const code = input.content
							.replace(/(>|})\s+(?![^]*?<\/(?:script|style)>|[^<]*?>|[^{]*?})/g, '$1')
							.replace(/(?<!<[^>]*?|{[^}]*?)\s+(<|{)(?![^]*<\/(?:script|style)>)/g, '$1');
						return { code };
					},
				},
			}),
			resolve(),
			css({ output: 'styles.css' }),
		],
	},
	{
		input: 'src/background.js',
		output: {
			file: 'dest/background.js',
		},
		plugins: [],
	},
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
		plugins: [resolve()],
	},
	{
		input: 'test/src/index.js',
		output: {
			file: 'test/public/bundle.js',
			name: 'App',
			format: 'iife',
		},
		plugins: [
			svelte({
				compilerOptions: {
					dev: true,
				},
			}),
			resolve(),
			css({ output: 'styles.css' }),
		],
	},
];
