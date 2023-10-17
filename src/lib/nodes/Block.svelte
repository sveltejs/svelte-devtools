<script lang="ts">
	import Indexer from '../components/Indexer.svelte';
	import Ellipsis from './Ellipsis.svelte';

	export let selected: boolean;
	export let tagName: string;
	export let source: string | undefined;
	export let expanded: boolean;
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
	class:expanded
	class:selected
	class="expandable tag-open tag-name"
	on:dblclick={() => (expanded = !expanded)}
>
	{#if source}
		<span>{source}</span>
	{:else}
		<Indexer text={`{#${tagName}}`} />
	{/if}
	{#if !expanded}
		<Ellipsis on:click={() => (expanded = true)} />
		<Indexer text={`{/${tagName}}`} />
	{/if}
</div>
{#if expanded}
	<slot />

	<div>
		<Indexer text={`{/${tagName}}`} />
	</div>
{/if}

<style>
	div {
		width: 100%;
		display: flex;
		color: rgb(151, 164, 179);
	}

	:global(.dark) div {
		color: rgb(175, 181, 191);
	}
</style>
