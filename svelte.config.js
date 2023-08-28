import { vitePreprocess } from '@sveltejs/kit/vite';
import adapter from 'svelte-adapter-extension';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [vitePreprocess()],

	kit: {
		adapter: adapter({}),

		appDir: 'ext',

		prerender: {
			handleHttpError: 'warn',
		},
	},

	onwarn(warning, handler) {
		!warning.message.includes('chrome') && handler(warning);
	},
};

export default config;
