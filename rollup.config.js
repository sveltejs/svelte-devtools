// TODO: generate through vite if possible

import { defineConfig } from 'rollup';

export default defineConfig({
	input: 'src/client/index.js',
	output: [
		{ file: 'static/courier.js', format: 'iife' },
		{ file: 'build/courier.js', format: 'iife' },
	],
});
