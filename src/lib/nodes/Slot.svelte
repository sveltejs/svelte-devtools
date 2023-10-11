<script lang="ts">
	import Indexer from '../components/Indexer.svelte';
	import Ellipsis from './Ellipsis.svelte';

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
	<Indexer text={`<${tagName}>`} style="color: #c586c0" />

	{#if !expanded}
		<Ellipsis on:click={() => (expanded = true)} />
		<Indexer text={`</${tagName}>`} style="color: #c586c0" />
	{/if}
</div>
{#if expanded}
	<slot />

	<Indexer text={`</${tagName}>`} {hover} style="color: #c586c0; {style}" />
{/if}

<style>
	div {
		display: flex;
	}
</style>
