import * as fs from 'fs'
import svelte from 'rollup-plugin-svelte'
import resolve from 'rollup-plugin-node-resolve'

export default [{
  input: 'src/index.js',
  external: ['chrome'],
  output: {
    file: 'dest/devtools/bundle.js',
    name: 'App',
    format: 'iife',
    globals: {
      chrome: 'chrome'
    }
  },
  plugins: [
    svelte({
      preprocess: {
        markup: input => {
          const blocks = {}
          const code = input.content
            .replace(/<!--block\s+(.+?)\s*-->([^]+?)<!--end-->/g, (_, name, block) => (blocks[name] = block, ''))
            .replace(/<!--use\s+(.+?)\s*?-->/g, (_, name) => blocks[name])
            .replace(/(>|})\s+(?![^]*?<\/(?:script|style)>|[^<]*?>|[^{]*?})/g, '$1')
            .replace(/(?<!<[^>]*?|{[^}]*?)\s+(<|{)(?![^]*<\/(?:script|style)>)/g, '$1')
          return { code }
        }
      },
      css: css => css.write('dest/devtools/styles.css'),
    }),
    resolve()
  ]
}, {
  input: 'src/client/index.js',
  output: {
    file: 'dest/privilegedContent.js',
    name: 'SvelteDevtools',
    format: 'iife',
    banner: `if (!window.tag) {
  window.tag = document.createElement('script')
  window.tag.text = \``,
    footer: `\`
  if (window.profilerEnabled) window.tag.text = window.tag.text.replace('let profilerEnabled = false;', '\$&\\nstartProfiler();')
  document.children[0].append(window.tag)
  const port = chrome.runtime.connect()
  port.onMessage.addListener(window.postMessage.bind(window))
  window.addEventListener(
    'message',
    e => e.source == window && port.postMessage(e.data),
    false
  )
}`
  },
  plugins: [ resolve() ]
}, {
  input: 'test/src/index.js',
  output: {
    file: 'test/public/bundle.js',
    name: 'App',
    format: 'iife'
  },
  plugins: [
    svelte({
      dev: true,
      css: css => css.write('test/public/styles.css')
    }),
    resolve()
  ]
}]
