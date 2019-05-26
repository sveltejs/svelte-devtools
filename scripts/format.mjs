#!/bin/env node

import glob from 'tiny-glob'
import prettier from 'prettier'
import { promises as fs } from 'fs'

async function format(path) {
  // Problem with html entities sveltejs/svelte#2714
  if (path == 'src/nodes/Block.svelte' || path == 'src/nodes/Element.svelte' || path == 'src/nodes/Node.svelte' || path == 'src/nodes/Editable.svelte')
    return true

  try {
    const contents = await fs.readFile(path, { encoding: 'utf8' })
    const formatted = prettier.format(contents, {
      filepath: path,
      semi: false,
      singleQuote: true,
      pluginSearchDirs: ['.'],
      cssSortOrder: 'zen'
    })
    if (formatted == contents) {
      console.log(`\x1b[2m${path}\x1b[0m`)
      return true
    }

    console.log(path)
    await fs.writeFile(path, formatted)
    return true
  } catch (err) {
    console.error(`\x1b[31m${path}\x1b[0m`)
    console.error(err)
    return false
  }
}

;(async function() {
  const files = await glob('!(node_modules)/**/*.{js,mjs,svelte,html,json}')
  const res = await Promise.all(files.map(format))
  if (res.some(o => !o)) process.exit(1)
})()
