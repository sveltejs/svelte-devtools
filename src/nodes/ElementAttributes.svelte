<script>
	import SearchTerm from './SearchTerm.svelte';

	export let attributes;
	export let listeners;
</script>

{#each attributes as { key, value, isBound, flash } (key)}
	&nbsp;
	<span class:flash>
		<span class="attr-name">
			{#if isBound}bind:{/if}
			<SearchTerm text={key} />
		</span>
		=
		<span class="attr-value">
			<SearchTerm text={value} />
		</span>
	</span>
{/each}

{#each listeners as { event, handler, modifiers }}
	&nbsp;
	<span class="attr-name" data-tooltip={typeof handler == 'function' ? handler() : handler}>
		on:
		<SearchTerm text={event} />
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
