import { defineConfig } from 'rollup';

export default defineConfig([
	{
		input: 'static/background.js',
		output: {
			file: 'debug/background.js',
		},
	},
	{
		input: 'static/sensor.js',
		output: {
			file: 'debug/sensor.js',
		},
	},
	{
		input: 'src/client/index.js',
		output: [
			{ file: 'static/courier.js', format: 'iife' },
			{ file: 'debug/courier.js', format: 'iife' },
		],
	},
]);
