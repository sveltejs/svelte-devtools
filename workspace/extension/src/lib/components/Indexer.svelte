<script lang="ts">
	import { app } from '$lib/state.svelte';

	const { text = '', color = '' } = $props();

	const i = $derived(text.indexOf(app.query));
</script>

<p style:color>
	{#if i === -1 || app.query.length < 2}
		<span>{text}</span>
	{:else}
		{#if i !== 0}<span>{text.slice(0, i)}</span>{/if}
		<mark>{text.slice(i, i + app.query.length)}</mark>
		{#if i + app.query.length < text.length}
			<span>{text.slice(i + app.query.length)}</span>
		{/if}
	{/if}
</p>

<style>
	p {
		/* cannot be `inline`-based for ellipsis overflow below */
		display: flex;
		margin: 0;
	}
	span {
		overflow: hidden;
		text-overflow: ellipsis;
	}
</style>
