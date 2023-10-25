# Svelte DevTools

[![Chrome Web Store](https://img.shields.io/chrome-web-store/users/ckolcbmkjpjmangdbmnkpjigpkddpogn?color=blue&label=Chrome)](https://chrome.google.com/webstore/detail/svelte-devtools/kfidecgcdjjfpeckbblhmfkhmlgecoff)

Svelte DevTools is a Chrome extension for the [Svelte](https://svelte.dev/) framework. It allows you to inspect the Svelte state and component hierarchies in the Developer Tools.

After installing you will see a new tab in Developer Tools. This tab displays a tree of Svelte components, HTMLx blocks, and DOM elements that were rendered on the page. By selecting one of the nodes in the tree, you can inspect and edit its current state in the panel to the right.

![2.0.0 Screenshot](./.github/assets/screenshot-2.0.0.png '2.0.0 Screenshot')

## Requirements

The `svelte-devtools` extension requires your Svelte application to be compiled with the `dev` option set to `true`. If you're using [SvelteKit](https://kit.svelte.dev/), this is done automatically, outside of that you will need to set it manually.

This extension officially supports Svelte 4.0 and above.

## Development

Clone this repository, setup and run the build script

```sh
git clone https://github.com/sveltejs/svelte-devtools.git
cd svelte-devtools
pnpm install
pnpm build
```

This will build the codebase and output all the required files in the `build` directory. To load the extension for development, follow these steps:

1. Navigate to the extensions settings page
2. Turn on the 'Developer mode' switch
3. Click 'Load Unpacked' and select the `build` directory

## Acknowledgements

-   This extension was initially created and developed by [RedHatter](https://github.com/RedHatter)
