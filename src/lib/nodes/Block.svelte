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
		{source}
	{:else}
		&lbrace;#
		<Indexer text={tagName} />
		&rbrace;
	{/if}
	{#if !expanded}
		&hellip;&lbrace;/
		<Indexer text={tagName} />
		&rbrace;
	{/if}
</div>
{#if expanded}
	<slot />
	<div class="tag-close tag-name" class:hover {style}>
		&lbrace;/
		<Indexer text={tagName} />
		&rbrace;
	</div>
{/if}

<style>
	div {
		/* height: 1.333rem; */
		line-height: 1.5;
	}

	div {
		color: rgb(151, 164, 179);
	}

	:global(.dark) div {
		color: rgb(175, 181, 191);
	}
</style>
