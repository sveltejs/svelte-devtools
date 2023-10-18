<script lang="ts">
	import { query } from '$lib/store';

	export let text = '';
	export let color = '';

	$: i = text.indexOf($query);
</script>

<p style:color>
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
		display: inline-flex;
		margin: 0;
	}
	span {
		overflow: hidden;
		text-overflow: ellipsis;
	}
</style>
