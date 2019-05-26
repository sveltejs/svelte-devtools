# Svelte DevTools

Svelte DevTools extends the Firefox developer tools with the ability to inspect Svelte component hierarchies and modify component state.

## Limitations

Svelte DevTools works by intercepting and instrumenting the generated svelte bundle. This means that **minification or other modifications to the generated bundle may prevent Svelte DevTools from working.**

## Installation

Pre-packaged `xpi` archives can be downloaded from the releases page. Simply open the archive in firefox to install.

### From source

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
