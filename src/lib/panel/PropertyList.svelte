<script lang="ts">
	import Expandable from './Expandable.svelte';

	export let entries: Array<{ key: string; value: string }> = [];
	export let id: number;
	export let readonly = false;

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
				on:change={(e) => change(key, e.detail)}
			/>
		{/each}
	</ul>
{:else}
	<div class="empty">None</div>
{/if}

<style>
	ul {
		display: grid;
		gap: 0.25rem;
		padding-left: 1rem;
		margin: 0.25rem;
		font-size: 0.75rem;
	}

	.empty {
		margin: 0.5rem 0 0 1rem;
		color: rgb(118, 118, 118);
	}

	ul,
	div {
		margin-bottom: 1.5rem;
	}
</style>
