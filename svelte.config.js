import { vitePreprocess } from '@sveltejs/kit/vite';
import adapter from 'svelte-adapter-extension';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [vitePreprocess()],

	kit: {
		adapter: adapter({
			output: 'index.html',
		}),

		appDir: 'ext',

		prerender: {
			handleHttpError: 'warn',
		},

		typescript: {
			config(settings) {
				settings.include = [...settings.include, '../static/**/*.js', '../static/**/*.ts'];
				return settings;
			},
		},
	},

	onwarn(warning, handler) {
		!warning.message.includes('chrome') && handler(warning);
	},
};

export default config;
