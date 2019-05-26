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
        markup: input => ({
          code: input.content
            .replace(/(>|})\s+(?![^]*?<\/(?:script|style)>|[^<]*?>|[^{]*?})/g, '$1')
            .replace(/(?<!<[^>]*?|{[^}]*?)\s+(<|{)(?![^]*<\/(?:script|style)>)/g, '$1')
        })
      },
      css: css => css.write('dest/devtools/styles.css'),
    }),
    resolve()
  ]
}, {
  input: 'test/src/index.js',
  output: {
    file: 'test/public/bundle.js',
    name: 'App',
    format: 'iife'
  },
  plugins: [
    svelte({
      css: css => css.write('test/public/styles.css'),
    }),
    resolve()
  ]
}]
