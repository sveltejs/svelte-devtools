import { json } from '@sveltejs/kit';

const base = 'https://github.com/sveltejs/svelte-devtools/releases/download';
const updates = ['2.2.0'];

export async function GET() {
	return json({
		addons: {
			'firefox-devtools@svelte.dev': {
				updates: updates.map((v) => {
					const link = `${base}/v${v}/svelte-devtools.xpi`;
					return { version: v, update_link: link };
				}),
			},
		},
	});
}
