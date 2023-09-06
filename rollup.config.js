import { nodeResolve } from '@rollup/plugin-node-resolve';

// TODO: generate through vite plugin if possible
export default [
	{
		input: 'src/client/index.js',
		output: [
			{ file: 'static/courier.js', format: 'iife' },
			{ file: 'build/courier.js', format: 'iife' },
		],
		plugins: [nodeResolve()],
	},
];
