import fs from 'fs'
import transform from 'rollup-plugin-transform-input'
import prettier from 'prettier'
import postcss from 'postcss'
import sorting from 'postcss-sorting'

function formatContents(filepath, source) {
  return prettier.format(source, {
    filepath,
    arrowParens: 'avoid',
    semi: false,
    singleQuote: true,
    pluginSearchDirs: ['.'],
  })
}

function formatCss(filepath, source, zen) {
  return filepath &&
    (filepath.endsWith('.svelte') || filepath.endsWith('.html'))
    ? source
        .replace(
          /<style(.*?)>(.+?)<\/style>/gs,
          (_, p1, p2) => `<style${p1}>${formatCss(null, p2, zen)}</style>`
        )
    : postcss([sorting({ 'properties-order': zen })]).process(source, {
        from: filepath,
        to: filepath,
      }).css
}

export default function (options) {
  const zen = fs.readFileSync('zen', 'utf8').split('\n')

  return {
    ...transform({
      ...options,
      async transform(source, filepath) {
        try {
          await fs.promises.access(filepath)

          let formatted = formatContents(filepath, source)
          if (
            filepath.endsWith('.svelte') ||
            filepath.endsWith('.html') ||
            filepath.endsWith('.css')
          )
            formatted = formatCss(filepath, formatted, zen)

          return formatted
        } catch (err) {
          return source
        }
      },
    }),
    name: 'format',
  }
}
