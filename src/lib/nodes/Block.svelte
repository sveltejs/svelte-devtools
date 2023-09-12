<script lang="ts">
	import Indexer from '../components/Indexer.svelte';

	export let style: string;
	export let hover: boolean;
	export let selected: boolean;
	export let tagName: string;
	export let source: string;
	export let expanded: boolean;
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
	{style}
	class:expanded
	class:hover
	class:selected
	class="expandable tag-open tag-name"
	on:dblclick={() => (expanded = !expanded)}
>
	{#if source}
		<span>{source}</span>
	{:else}
		<span>&lbrace;#</span>
		<Indexer text={tagName} />
		<span>&rbrace;</span>
	{/if}
	{#if !expanded}
		<span>&hellip;&lbrace;/</span>
		<Indexer text={tagName} />
		<span>&rbrace;</span>
	{/if}
</div>
{#if expanded}
	<slot />

	<div class="tag-close tag-name" class:hover {style}>
		<span>&lbrace;/</span>
		<Indexer text={tagName} />
		<span>&rbrace;</span>
	</div>
{/if}

<style>
	div {
		display: flex;
		color: rgb(151, 164, 179);
		line-height: 1.5;
	}

	:global(.dark) div {
		color: rgb(175, 181, 191);
	}
</style>
