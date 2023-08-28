<script>
	import Collapse from './Collapse.svelte';
	import SearchTerm from './SearchTerm.svelte';

	export let style;
	export let hover;
	export let selected;
	export let tagName;
	export let source;
	export let collapsed;
</script>

<div
	class="tag-open tag-name"
	class:hover
	class:selected
	{style}
	on:dblclick={(e) => (collapsed = !collapsed)}
>
	<Collapse {selected} bind:collapsed />
	{#if source}
		{source}
	{:else}
		&lbrace;#
		<SearchTerm text={tagName} />
		&rbrace;
	{/if}
	{#if collapsed}
		&hellip;&lbrace;/
		<SearchTerm text={tagName} />
		&rbrace;
	{/if}
</div>
{#if !collapsed}
	<slot />
	<div class="tag-close tag-name" class:hover {style}>
		&lbrace;/
		<SearchTerm text={tagName} />
		&rbrace;
	</div>
{/if}

<style>
	div {
		height: 1.333rem /* 16px */;
		line-height: 1.333rem /* 16px */;
	}

	div {
		color: rgb(151, 164, 179);
	}

	:global(.dark) div {
		color: rgb(175, 181, 191);
	}
</style>
