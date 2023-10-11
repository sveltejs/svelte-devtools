<script lang="ts">
	import { query } from '$lib/store';

	export let text = '';
	export let style = '';
	export let hover = false;

	$: i = text.indexOf($query);
</script>

<div {style} class:hover>
	{#if i === -1 || $query.length < 2}
		<span>{text}</span>
	{:else}
		{#if i !== 0}<span>{text.slice(0, i)}</span>{/if}
		<mark>{text.slice(i, i + $query.length)}</mark>
		{#if i + $query.length < text.length}
			<span>{text.slice(i + $query.length)}</span>
		{/if}
	{/if}
</div>

<style>
	div {
		display: flex;
	}
	span {
		overflow: hidden;
		text-overflow: ellipsis;
	}
</style>
