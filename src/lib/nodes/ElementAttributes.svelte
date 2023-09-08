<script lang="ts">
	import Indexer from '../components/Indexer.svelte';

	export let attributes: Array<{
		key: string;
		value: string;
		bounded?: boolean;
		flash?: boolean;
	}>;
	export let listeners: Array<{
		event: any;
		handler: any;
		modifiers: any;
	}>;
</script>

{#each attributes as { key, value, bounded, flash } (key)}
	<span>&nbsp;</span>
	<span class:flash style:display="flex">
		<span class="attr-name">
			{#if bounded}bind:{/if}
			<Indexer text={key} />
		</span>
		<span>=</span>
		<span class="attr-value">
			<Indexer text={value} />
		</span>
	</span>
{/each}

{#each listeners as { event, handler, modifiers }}
	<span>&nbsp;</span>
	<span class="attr-name" data-tooltip={typeof handler == 'function' ? handler() : handler}>
		on:
		<Indexer text={event} />
		{#if modifiers && modifiers.length}|{modifiers.join('|')}{/if}
	</span>
{/each}

<style>
	.attr-name {
		position: relative;
		color: rgb(221, 0, 169);
	}

	.attr-value {
		display: inline-block;
		overflow: hidden;
		max-width: 16.667rem /* 200px */;
		color: rgb(0, 62, 170);
		vertical-align: bottom;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	:global(.dark) .attr-name {
		color: rgb(255, 125, 233);
	}

	:global(.dark) .attr-value {
		color: rgb(185, 142, 255);
	}
</style>
