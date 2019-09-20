# Svelte DevTools

Svelte Devtools is a Firefox and Chrome extension for the Svelte javascript framework. It allows you to inspect the Svelte state and component hierarchies in the Developer Tools.

After installing you will see a new tab in Developer Tools. This tab displays a tree of Svelte components, HTMLx blocks, and DOM elements that were rendered on the page. By selecting one of the nodes in the tree, you can inspect and edit its current state in the panel to the right.

**Requires svelte version 3.12.0 or above**

![0.1.1 Screenshot](https://raw.githubusercontent.com/RedHatter/svelte-devtools/master/screenshot.png "0.2.0 Screenshot")

## Installation

### Firefox

Install from the [firefox addon page](https://addons.mozilla.org/en-US/firefox/addon/svelte-devtools/).

#### From source

Unsigned addons can't be install in firefox permanently but addons can be installed temporarily from the `about:debugging` page.

1. Clone this repository and run the package script.
```
git clone https://github.com/RedHatter/svelte-devtools.git
cd svelte-devtools
npm install
npm run package
```
This should generate a zip file under `web-ext-artifacts`.

2. Open `about:debugging` in firefox. Click "Load Temporary Add-on" and choose the generated zip file.

### Chrome

Svelte DevTools is still under review for chrome. However pre-packaged archives can be downloaded from the releases page.

1. Download the `zip` archive from the release page and unpack it.
2. Open chrome and navigate to `chrome://extensions/`.
3. Turn on developer mode using the 'Developer mode' switch in the upper right hand corner of the page.
3. Click 'Load Unpacked' and select the directory contain the extension files.

#### From source

1. Clone this repository and run the build script.
```
git clone https://github.com/RedHatter/svelte-devtools.git
cd svelte-devtools
npm install
npm run build
```
2. Open chrome and navigate to `chrome://extensions/`.
3. Turn on developer mode using the 'Developer mode' switch in the upper right hand corner of the page.
3. Click 'Load Unpacked' and select the `dest` directory.
