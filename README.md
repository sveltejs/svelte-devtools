# Svelte DevTools

[![Mozilla Add-on](https://img.shields.io/amo/users/svelte-devtools?color=red&label=Firefox)](https://addons.mozilla.org/en-US/firefox/addon/svelte-devtools/) [![Chrome Web Store](https://img.shields.io/chrome-web-store/users/ckolcbmkjpjmangdbmnkpjigpkddpogn?color=blue&label=Chrome)](https://chrome.google.com/webstore/detail/svelte-devtools/ckolcbmkjpjmangdbmnkpjigpkddpogn)

Install from the [Firefox addon page](https://addons.mozilla.org/en-US/firefox/addon/svelte-devtools/) or the
[Chrome addon page](https://chrome.google.com/webstore/detail/svelte-devtools/ckolcbmkjpjmangdbmnkpjigpkddpogn)

**Svelte devtools is actively maintained. If you have any problems or feature requests feel free to create an issue.**

Svelte Devtools is a Firefox and Chrome extension for the Svelte javascript framework. It allows you to inspect the Svelte state and component hierarchies in the Developer Tools.

After installing you will see a new tab in Developer Tools. This tab displays a tree of Svelte components, HTMLx blocks, and DOM elements that were rendered on the page. By selecting one of the nodes in the tree, you can inspect and edit its current state in the panel to the right.

**Requires svelte version 3.12.0 or above**

![1.1.0 Screenshot](./.github/assets/screenshot-1.1.0.png '1.1.0 Screenshot')

## Enabling dev mode

In order for svelte-devtools to comunicate with your application bundle the svelte compiler must have the `dev` option set to `true`.

### Template

By default the [svelte template](https://github.com/sveltejs/template) will set `dev: true` when running `npm run dev` and `false` otherwise.

### Rollup

Below is a minimalist rollup config with `dev: true` set.

```
// rollup.config.js
import * as fs from 'fs';
import svelte from 'rollup-plugin-svelte';

export default {
  input: 'src/main.js',
  output: {
    file: 'public/bundle.js',
    format: 'iife'
  },
  plugins: [
    svelte({
      compilerOptions: {
        dev: true
      }
    })
  ]
}
```

### Webpack

Below is the relevant snipet from a `webpack.config.js` with `dev: true` set.

```
  ...
  module: {
    rules: [
      ...
      {
        test: /\.(html|svelte)$/,
        exclude: /node_modules/,
        use: {
          loader: 'svelte-loader',
          options: {
            compilerOptions: {
              dev: true,
            }
          },
        },
      },
      ...
    ]
  },
  ...
```

## Build from source

### Firefox

Clone this repository and run the package script.

```
git clone https://github.com/sveltejs/svelte-devtools.git
cd svelte-devtools
npm install
npm run package:firefox
```

This should build the codebase and output a zip file under `web-ext-artifacts`.

Unsigned addons can't be install in firefox permanently but addons can be installed temporarily.

1. Navigate to `about:debugging`.
2. Click "Load Temporary Add-on" and choose the generated zip file.

### Chrome

Clone this repository and run the package script.

```
git clone https://github.com/sveltejs/svelte-devtools.git
cd svelte-devtools
npm install
npm run package:chrome
```

This should build the codebase and output a zip file under `web-ext-artifacts`.

1. Navigate to `chrome://extensions/`.
2. Turn on developer mode using the 'Developer mode' switch in the upper right hand corner of the page.
3. Click 'Load Unpacked' and select the `dest` directory.

## Acknowledgements

-   This extension was initially created and developed by [RedHatter](https://github.com/RedHatter)
