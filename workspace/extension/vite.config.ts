import { resolve } from 'node:path';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';

export default defineConfig(() => {
	return {
		plugins: [svelte()],

		build: {
			cssTarget: 'chrome111',
			outDir: 'build',
		},

		publicDir: 'static',

		resolve: {
			alias: {
				$lib: resolve(__dirname, 'src/lib'),
			},
		},
	};
});
