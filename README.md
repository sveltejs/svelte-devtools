# Svelte DevTools

Svelte DevTools extends the Firefox and Chrome developer tools with the ability to inspect Svelte component hierarchies and modify component state.

## Limitations

Svelte DevTools works by intercepting and instrumenting the generated svelte bundle. This means that **minification or any other modifications to the generated bundle may prevent Svelte DevTools from working.**

## Installation

Svelte DevTools is still in beta and has yet to be published to the respective extension stores. However pre-packaged archives can be downloaded from the releases page.

### Firefox

Download the `xpi` archive from the release page and simply open the file in firefox to install.

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
