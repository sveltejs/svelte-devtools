<script lang="ts">
	import Indexer from '../components/Indexer.svelte';

	export let style: string;
	export let hover: boolean;
	export let selected: boolean;
	export let tagName: string;
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
	<span>&lt;</span>
	<Indexer text={tagName} />
	<span>&gt;</span>

	{#if !expanded}
		<span>&hellip;&lt;/</span>
		<Indexer text={tagName} />
		<span>&gt;</span>
	{/if}
</div>
{#if expanded}
	<slot />
	<div class="tag-close tag-name" class:hover {style}>
		<span>&lt;/</span>
		<Indexer text={tagName} />
		<span>&gt;</span>
	</div>
{/if}

<style>
	div {
		/* height: 1.333rem; */
		line-height: 1.5;
	}

	div {
		color: rgb(0, 116, 232);
	}

	:global(.dark) div {
		color: rgb(117, 191, 255);
	}
</style>
