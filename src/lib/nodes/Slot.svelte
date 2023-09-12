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
	<Indexer text={tagName} color="#c586c0" />
	<span>&gt;</span>

	{#if !expanded}
		<span>&hellip;&lt;/</span>
		<Indexer text={tagName} color="#c586c0" />
		<span>&gt;</span>
	{/if}
</div>
{#if expanded}
	<slot />

	<div class="tag-close tag-name" class:hover {style}>
		<span>&lt;/</span>
		<Indexer text={tagName} color="#c586c0" />
		<span>&gt;</span>
	</div>
{/if}

<style>
	div {
		display: flex;
	}
</style>
