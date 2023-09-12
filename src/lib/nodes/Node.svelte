<script>
	import { visibility, hoveredNodeId, selectedNode } from '../store.js';
	import Element from './Element.svelte';
	import Block from './Block.svelte';
	import Slot from './Slot.svelte';
	import Iteration from './Iteration.svelte';
	import Text from './Text.svelte';
	import Anchor from './Anchor.svelte';

	export let node;
	export let depth = 1;

	let _timeout = null;
	node.invalidate = () => {
		if (_timeout) return;

		_timeout = setTimeout(() => {
			_timeout = null;
			node = node;
		}, 100);
	};

	$: nodeType = {
		element: Element,
		component: Element,
		block: Block,
		slot: Slot,
		iteration: Iteration,
		text: Text,
		anchor: Anchor,
	}[node.type];

	let lastLength = node.children.length;
	let flash = false;
	$: {
		flash = flash || node.children.length != lastLength;
		lastLength = node.children.length;
	}
</script>

{#if $visibility[node.type]}
	<li
		bind:this={node.dom}
		class:flash
		on:animationend={(e) => (flash = false)}
		on:mouseover|stopPropagation={(e) => ($hoveredNodeId = node.id)}
		on:click|stopPropagation={(e) => ($selectedNode = node)}
	>
		<svelte:component
			this={nodeType}
			tagName={node.tagName}
			bind:collapsed={node.collapsed}
			{...node.detail}
			hasChildren={node.children.length != 0}
			hover={$hoveredNodeId == node.id}
			selected={$selectedNode.id == node.id}
			style={`padding-left: ${depth * 12}px`}
		>
			{#if $selectedNode.id == node.id}
				<span style={`left: ${depth * 12 + 6}px`} />
			{/if}
			<ul>
				{#each node.children as child (child.id)}
					<svelte:self node={child} depth={node.type == 'iteration' ? depth : depth + 1} />
				{/each}
			</ul>
		</svelte:component>
	</li>
{:else}
	{#each node.children as node (node.id)}
		<svelte:self {node} {depth} />
	{/each}
{/if}

<style>
	li {
		position: relative;
	}

	span {
		position: absolute;
		top: 1.6rem;
		bottom: 1.6rem;
		z-index: 1;
		width: 0.167rem /* 2px */;
		background-color: #e0e0e2;
	}

	li.flash :global(> :first-child),
	li.flash :global(> :first-child *),
	li :global(.flash),
	li :global(.flash *) {
		animation: flash 0.8s ease-in-out;
	}

	@keyframes flash {
		10% {
			background-color: rgb(250, 217, 242);
		}
	}

	li :global(.selected),
	li :global(.selected *),
	li :global(.hover.selected) {
		background-color: rgb(0, 116, 232);
		color: #ffffff;
	}

	li :global(> .selected::after) {
		content: ' == $s';
	}

	li :global(.hover) {
		background-color: #f0f9fe;
	}

	:global(.dark) span,
	:global(.dark) li :global(.selected),
	:global(.dark) li :global(.selected *),
	:global(.dark) li :global(.hover.selected) {
		background-color: rgb(32, 78, 138);
		color: #ffffff;
	}

	:global(.dark) li :global(.hover) {
		background-color: rgb(53, 59, 72);
	}
</style>
