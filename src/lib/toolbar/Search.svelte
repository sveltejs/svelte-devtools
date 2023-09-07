<script lang="ts">
	import { rootNodes, selectedNode, searchValue } from '$lib/store';
	import Button from '../components/Button.svelte';

	function next() {
		if (position >= results.length - 1) position = -1;
		selectedNode.set(results[++position]);
	}

	function prev() {
		if (position <= 0) position = results.length;
		selectedNode.set(results[--position]);
	}

	function search(list: any[]) {
		for (const node of list) {
			if (
				node.tagName.includes($searchValue) ||
				(node.detail && JSON.stringify(node.detail).includes($searchValue))
			)
				results.push(node);
			search(node.children);
		}
	}

	let results: any[] = [];
	let position = -1;
	$: {
		$searchValue;
		results = [];
		position = -1;
		if ($searchValue.length > 1) search($rootNodes);
	}
</script>

<form on:submit|preventDefault={next}>
	<div class="separator" />
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
		<path
			fill="rgba(135, 135, 137, 0.9)"
			d="M15.707 14.293l-5-5-1.414 1.414 5 5a1 1 0 0 0 1.414-1.414z"
		/>
		<path
			fill="rgba(135, 135, 137, 0.9)"
			fill-rule="evenodd"
			d="M6 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm0 2A6 6 0 1 0 6 0a6 6 0 0 0 0 12z"
		/>
	</svg>
	<input placeholder="Search" bind:value={$searchValue} />

	{#if position > -1}
		<span style:font-size="0.625rem">{position + 1} of {results.length}</span>
	{/if}

	<Button type="submit" disabled={!results.length}>
		<div class="next" />
	</Button>
	<Button on:click={prev} disabled={!results.length}>
		<div class="prev" />
	</Button>
</form>

<style>
	form {
		display: flex;
		gap: 0.5rem;
		flex-grow: 1;
		align-items: center;
	}

	svg {
		width: 1rem;
	}

	input {
		flex-grow: 1;
		outline: none;
		border: none;
		background: none;
		color: inherit;
		font-size: inherit;
	}

	.separator {
		margin: 0 0.5rem;
		width: 0.1rem;
		height: calc(100% - 0.1rem);
		background-color: rgb(224, 224, 226);
	}

	:global(.dark) .separator {
		background-color: rgb(60, 60, 61);
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
