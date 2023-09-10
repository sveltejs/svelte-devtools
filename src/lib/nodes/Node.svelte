<script lang="ts">
	import Indexer from '$lib/components/Indexer.svelte';
	import Element from './Element.svelte';
	import Block from './Block.svelte';
	import Slot from './Slot.svelte';
	import Iteration from './Iteration.svelte';
	import Anchor from './Anchor.svelte';

	import { background } from '$lib/runtime';
	import { visibility, hovered, selected } from '$lib/store';

	export let node: any;
	export let depth = 1;

	let _timeout: null | NodeJS.Timeout;
	node.invalidate = () => {
		if (_timeout) return;

		_timeout = setTimeout(() => {
			_timeout = null;
			node = node;
		}, 100);
	};

	let lastLength = node.children.length;
	let flash = false;
	$: {
		flash = flash || node.children.length !== lastLength;
		lastLength = node.children.length;
	}
</script>

{#if $visibility[node.type]}
	{@const active = $selected?.id === node.id}
	{@const current = $hovered?.id === node.id}
	{@const style = `padding-left: ${depth * 12}px`}
	{@const left = depth * 12 + 4}

	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-mouse-events-have-key-events -->
	<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
	<li
		class:flash
		bind:this={node.dom}
		on:animationend={() => (flash = false)}
		on:click|stopPropagation={() => selected.set(node)}
		on:mouseenter|stopPropagation={() => {
			hovered.set(node);
			background.send('ext/highlight', node.id);
		}}
	>
		{#if node.type === 'component' || node.type === 'element'}
			<Element
				tagName={node.tagName}
				selected={active}
				hover={current}
				attributes={node.detail.attributes}
				listeners={node.detail.listeners}
				hasChildren={node.children.length}
				{style}
				bind:expanded={node.expanded}
			>
				<ul class:active style:--left="{left}px">
					{#each node.children as child (child.id)}
						{@const level = node.type == 'iteration' ? depth : depth + 1}

						<svelte:self node={child} depth={level} />
					{/each}
				</ul>
			</Element>
		{:else if node.type === 'block'}
			<Block
				tagName={node.tagName}
				selected={active}
				hover={current}
				source={node.detail.source}
				{style}
				bind:expanded={node.expanded}
			>
				<ul class:active style:--left="{left}px">
					{#each node.children as child (child.id)}
						{@const level = node.type == 'iteration' ? depth : depth + 1}

						<svelte:self node={child} depth={level} />
					{/each}
				</ul>
			</Block>
		{:else if node.type === 'iteration'}
			<Iteration selected={active} hover={current} {style}>
				<ul class:active style:--left="{left}px">
					{#each node.children as child (child.id)}
						{@const level = node.type == 'iteration' ? depth : depth + 1}

						<svelte:self node={child} depth={level} />
					{/each}
				</ul>
			</Iteration>
		{:else if node.type === 'slot'}
			<Slot
				tagName={node.tagName}
				selected={active}
				hover={current}
				{style}
				bind:expanded={node.expanded}
			>
				<ul class:active style:--left="{left}px">
					{#each node.children as child (child.id)}
						{@const level = node.type == 'iteration' ? depth : depth + 1}

						<svelte:self node={child} depth={level} />
					{/each}
				</ul>
			</Slot>
		{:else if node.type === 'text'}
			<div {style}>
				<Indexer text={node.detail.nodeValue} />
			</div>
		{:else if node.type === 'anchor'}
			<Anchor {style} />
		{/if}
	</li>
{:else}
	{#each node.children as node (node.id)}
		<svelte:self {node} {depth} />
	{/each}
{/if}

<style>
	li {
		position: relative;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		font-size: 0.75rem;
	}

	ul {
		width: 100%;
		position: relative;
	}
	ul.active::before {
		content: '';
		z-index: 1;
		width: 0.125rem;
		position: absolute;
		top: 0.25rem;
		bottom: 0.25rem;
		left: var(--left);
		background: #e0e0e2;
	}

	/* li:hover,
	li.hovered {
		background: #f0f9fe;
	}
	li.selected {
		background: rgb(0, 116, 232);
		color: #ffffff;
	} */

	li.flash :global(> :first-child),
	li.flash :global(> :first-child *),
	li :global(.flash),
	li :global(.flash *) {
		animation: flash 0.8s ease-in-out;
	}

	li :global(.selected),
	li :global(.selected *),
	li :global(.hover.selected) {
		background: rgb(0, 116, 232);
		color: #ffffff;
	}

	li :global(> .selected::after) {
		content: '=== $s';
		margin-left: 0.5rem;
	}

	li :global(.hover) {
		background: #f0f9fe;
	}

	:global(.dark) li:hover,
	/* :global(.dark) li.hovered, */
	:global(.dark) li :global(.hover) {
		background: rgb(53, 59, 72);
	}

	:global(.dark) span,
	/* :global(.dark) li.selected, */
	:global(.dark) li :global(.selected),
	:global(.dark) li :global(.selected *),
	:global(.dark) li :global(.hover.selected) {
		background: rgb(32, 78, 138);
		color: #ffffff;
	}

	@keyframes flash {
		10% {
			background: rgb(250, 217, 242);
		}
	}
</style>
