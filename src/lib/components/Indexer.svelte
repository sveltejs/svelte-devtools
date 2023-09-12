<script lang="ts">
	import { query } from '$lib/store';

	export let text = '';
	export let color = '';

	$: i = text ? text.indexOf($query) : -1;
</script>

<div style:color>
	{#if i === -1 || $query.length < 2}
		<span>{text}</span>
	{:else}
		<span>{text.slice(0, i)}</span>
		<mark>{text.slice(i, i + $query.length)}</mark>
		<span>{text.slice(i + $query.length)}</span>
	{/if}
</div>

<style>
	div {
		display: flex;
	}
</style>
