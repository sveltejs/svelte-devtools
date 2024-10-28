# Svelte DevTools

<a href="https://chrome.google.com/webstore/detail/svelte-devtools/kfidecgcdjjfpeckbblhmfkhmlgecoff">
	<picture>
		<source media="(prefers-color-scheme: dark)" srcset="https://storage.googleapis.com/web-dev-uploads/image/WlD8wC6g8khYWPJUsQceQkhXSlv1/UV4C4ybeBTsZt43U4xis.png">
		<img alt="Chrome Web Store" src="https://storage.googleapis.com/web-dev-uploads/image/WlD8wC6g8khYWPJUsQceQkhXSlv1/tbyBjqi7Zu733AAKA5n4.png">
	</picture>
</a>

Svelte DevTools is a browser extension for the [Svelte](https://svelte.dev/) framework. It allows you to inspect the Svelte state and component hierarchies in the Developer Tools.

After installing you will see a new tab in Developer Tools. This tab displays a tree of Svelte components, HTMLx blocks, and DOM elements that were rendered on the page. By selecting one of the nodes in the tree, you can inspect and edit its current state in the panel to the right.

> For Firefox users, you can install the [`.xpi` file of the latest version from the GitHub releases page](https://github.com/sveltejs/svelte-devtools/releases/latest). Note that if you grab the `.zip` file, you will need to load it as a temporary extension and enable "Always Allow on localhost" in the extension settings.

![2.0.0 Screenshot](./.github/assets/screenshot-2.0.0.png '2.0.0 Screenshot')

## Requirements

The `svelte-devtools` extension requires the following to be true:

- Chrome or Firefox version 121 or higher
- Application running Svelte version `^4.0.0`
- Application compiled with `dev: true` ([SvelteKit](https://kit.svelte.dev/) does this automatically for you)

## Development

Clone this repository and setup the environment with `pnpm`

```sh
git clone https://github.com/sveltejs/svelte-devtools.git
cd svelte-devtools
pnpm install

cd workspace/extension
pnpm dev
```

To work on the extension, run the `dev` script from `workspace/extension` directory

```sh
cd workspace/extension
pnpm dev
```

This will build the extension and create a directory called `build`. Steps may vary depending on the browser you are using, but generally:

1. Navigate to the extensions settings page
2. Turn on the 'Developer mode' switch
3. Click 'Load Unpacked' and select the `build` directory

## Acknowledgements

-   This extension was initially created and developed by [RedHatter](https://github.com/RedHatter)
