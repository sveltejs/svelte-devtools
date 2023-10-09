import { defineConfig } from 'rollup';

export default defineConfig([
	{
		input: 'static/background.js',
		output: {
			file: 'build/background.js',
		},
	},
	{
		input: 'static/sensor.js',
		output: {
			file: 'build/sensor.js',
		},
	},
	{
		input: 'src/client/index.js',
		output: [
			{ file: 'static/courier.js', format: 'iife' },
			{ file: 'build/courier.js', format: 'iife' },
		],
	},
]);
