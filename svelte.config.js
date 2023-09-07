import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default {
	preprocess: vitePreprocess(),

	onwarn(warning, handler) {
		if (warning.message.includes('A11y')) return;
		!warning.message.includes('chrome') && handler(warning);
	},
};
