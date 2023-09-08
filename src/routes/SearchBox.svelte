<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import { root, selected, query } from '$lib/store';

	function search(list: any[]) {
		for (const node of list) {
			if (
				node.tagName.includes($query) ||
				(node.detail && JSON.stringify(node.detail).includes($query))
			)
				results.push(node);
			search(node.children);
		}
	}

	let results: typeof $root = [];
	let position = -1;
	$: if ($query.length > 1) {
		results = [];
		position = -1;
		search($root);
	}
</script>

<form
	on:submit|preventDefault={() => {
		if (position >= results.length - 1) position = -1;
		selected.set(results[++position]);
	}}
>
	<svg viewBox="0 0 16 16" width="1rem" fill="rgba(135, 135, 137, 0.9)">
		<path d="M15.707 14.293l-5-5-1.414 1.414 5 5a1 1 0 0 0 1.414-1.414z" />
		<path
			fill-rule="evenodd"
			d="M6 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm0 2A6 6 0 1 0 6 0a6 6 0 0 0 0 12z"
		/>
	</svg>

	<input placeholder="Search" bind:value={$query} />

	{#if position > -1}
		<span style:font-size="0.625rem">{position + 1} of {results.length}</span>
	{/if}

	<Button type="submit" disabled={!results.length}>
		<div class="next" />
	</Button>
	<Button
		disabled={!results.length}
		on:click={() => {
			if (position <= 0) position = results.length;
			selected.set(results[--position]);
		}}
	>
		<div class="prev" />
	</Button>
</form>

<style>
	form {
		display: flex;
		gap: 0.5rem;
		flex-grow: 1;
		align-items: center;
		padding: 0 0.5rem;
	}

	input {
		flex-grow: 1;
		outline: none;
		border: none;
		background: none;
		color: inherit;
		font-size: inherit;
	}

	.next,
	.prev {
		position: relative;
		display: block;
		width: 0.5rem;
		height: 0.5rem;
		border-style: solid;
	}
	.next {
		border-width: 0 0.1rem 0.1rem 0;
		transform: translate3d(0, -25%, 0) rotate(45deg);
	}
	.prev {
		border-width: 0.1rem 0 0 0.1rem;
		transform: translate3d(0, 25%, 0) rotate(45deg);
	}
</style>
