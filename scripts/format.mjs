#!/bin/env node

import glob from 'tiny-glob'
import prettier from 'prettier'
import { promises as fs } from 'fs'

async function format(path, cache) {
  if (path == 'dest/devtools/bundle.js' || path == 'test/public/bundle.js')
    return true

  try {
    const stat = await fs.stat(path)
    if (stat.mtimeMs == cache[path]) return true

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
      cache[path] = stat.mtimeMs
      return true
    }

    console.log(path)
    await fs.writeFile(path, formatted)
    cache[path] = (await fs.stat(path)).mtimeMs
    return true
  } catch (err) {
    console.error(`\x1b[31m${path}\x1b[0m`)
    console.error(err.message)
    return false
  }
}

;(async function() {
  let cache = {}

  try {
    cache = JSON.parse(await fs.readFile('.cache', 'utf8'))
  } catch (err) {}

  const files = await glob('!(node_modules)/**/*.{js,mjs,svelte,html,json}')
  const res = await Promise.all(files.map(o => format(o, cache)))

  await fs.writeFile('.cache', JSON.stringify(cache))

  if (res.some(o => !o)) process.exit(1)
})()
