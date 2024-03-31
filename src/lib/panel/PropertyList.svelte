<script lang="ts">
	import Expandable from './Expandable.svelte';

	interface Props {
		id: string;
		entries?: Array<{ key: string; value: any }>;
		readonly?: boolean;
	}

	let { id, entries = [], readonly = false }: Props = $props();

	const errors: Record<string, string | undefined> = {};
	function change(key: string, value: any) {
		chrome.devtools.inspectedWindow.eval(
			`__svelte_devtools_inject_state(${id}, '${key}', ${value})`,
			(_, error) => {
				errors[key] =
					error && error.isException
						? error.value.substring(0, error.value.indexOf('\n'))
						: undefined;
			},
		);
	}
</script>

{#if entries.length}
	<ul>
		{#each entries as { key, value } (key)}
			<Expandable
				{readonly}
				{key}
				{value}
				error={errors[key]}
				onchange={(updated) => change(key, updated)}
			/>
		{/each}
	</ul>
{:else}
	<div style:padding-left="1rem" style:color="rgb(118, 118, 118)">None</div>
{/if}

<style>
	ul {
		display: grid;
		gap: 0.25rem;
		padding-left: 1rem;
		font-size: 0.75rem;
	}
</style>
