import { app } from '$lib/state.svelte';

export const errors = $state<{ [keys: string]: string | false }>({});

export function inject(keys: string[], value: any) {
	const uuid = app.selected?.id;
	if (!uuid) return;

	const accessors = `[${keys.map((k) => `'${k}'`).join(', ')}]`;
	chrome.devtools.inspectedWindow.eval(
		`window['#SvelteDevTools'].inject('${uuid}', ${accessors}, ${value})`,
		(_, error) => {
			const id = `${uuid}+${keys.join('.')}`;
			errors[id] = error?.isException && error.value.slice(0, error.value.indexOf('\n'));
		},
	);
}
