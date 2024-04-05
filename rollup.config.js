import { defineConfig } from 'rollup';

export default defineConfig([
	{
		input: 'static/background.js',
		output: {
			file: 'build/background.js',
		},
	},
	{
		input: 'src/client/core.js',
		output: [
			{ file: 'static/courier.js', format: 'iife' },
			{ file: 'build/courier.js', format: 'iife' },
		],
	},
]);
