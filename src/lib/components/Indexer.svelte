<script lang="ts">
	import { query } from '$lib/store';

	export let text = '';
	export let color = '';
	export let hover = false;

	$: i = text.indexOf($query);
</script>

<p class:hover style:color>
	{#if i === -1 || $query.length < 2}
		<span>{text}</span>
	{:else}
		{#if i !== 0}<span>{text.slice(0, i)}</span>{/if}
		<mark>{text.slice(i, i + $query.length)}</mark>
		{#if i + $query.length < text.length}
			<span>{text.slice(i + $query.length)}</span>
		{/if}
	{/if}
</p>

<style>
	p {
		display: inline;
		padding-left: 0;
		margin: 0;
	}
	span {
		overflow: hidden;
		text-overflow: ellipsis;
	}
</style>
