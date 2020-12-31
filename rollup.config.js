import * as fs from 'fs'
import svelte from 'rollup-plugin-svelte'
import resolve from 'rollup-plugin-node-resolve'
import css from 'rollup-plugin-css-only'
import format from './scripts/format.mjs'

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
    format(),
    svelte({
      preprocess: {
        markup: input => {
          const code = input.content
            .replace(/(>|})\s+(?![^]*?<\/(?:script|style)>|[^<]*?>|[^{]*?})/g, '$1')
            .replace(/(?<!<[^>]*?|{[^}]*?)\s+(<|{)(?![^]*<\/(?:script|style)>)/g, '$1')
          return { code }
        }
      },
    }),
    resolve(),
    css({ output: 'styles.css' }),
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
  window.addEventListener('unload', () => port.postMessage({ type: 'clear' }))
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
    format(),
    svelte({
      compilerOptions: {
        dev: true
      }
    }),
    resolve(),
    css({ output: 'styles.css' })
  ]
}]
