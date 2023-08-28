import { mkdirSync } from 'node:fs';
import svgexport from 'svgexport';

mkdirSync('build/icons', { recursive: true });
svgexport.render([
	{
		input: ['src/svelte-logo.svg'],
		output: [16, 24, 48, 96, 128].map((size) => [`build/icons/${size}.png`, `${size}:`]),
	},
]);
