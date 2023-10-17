<script lang="ts">
	import Indexer from '$lib/components/Indexer.svelte';
	import Element from './Element.svelte';
	import Block from './Block.svelte';
	import Slot from './Slot.svelte';

	import { background } from '$lib/runtime';
	import { visibility, hovered, selected } from '$lib/store';

	export let node: NonNullable<typeof $selected>;
	export let depth = 1;

	node.invalidate = () => (node = node);

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
	{@const indent = depth * 12}

	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
	<li
		class:flash
		style:--indent="{indent}px"
		bind:this={node.dom}
		on:animationend={() => (flash = false)}
		on:click|stopPropagation={() => selected.set(node)}
		on:mousemove|stopPropagation={() => {
			if ($hovered?.id === node.id) return;
			background.send('ext/highlight', node.id);
			hovered.set(node);
		}}
	>
		{#if node.type === 'component' || node.type === 'element'}
			<Element
				tagName={node.tagName}
				selected={active}
				hover={current}
				attributes={node.detail?.attributes || []}
				listeners={node.detail?.listeners || []}
				empty={!node.children.length || node.children.every((n) => !$visibility[n.type])}
				bind:expanded={node.expanded}
			>
				<ul class:active>
					{#each node.children as child (child.id)}
						<svelte:self node={child} depth={depth + 1} />
					{/each}
				</ul>
			</Element>
		{:else if node.type === 'block'}
			<Block
				tagName={node.tagName}
				selected={active}
				hover={current}
				source={node.detail?.source}
				bind:expanded={node.expanded}
			>
				<ul class:active>
					{#each node.children as child (child.id)}
						<svelte:self node={child} depth={depth + 1} />
					{/each}
				</ul>
			</Block>
		{:else if node.type === 'iteration'}
			<ul class:active>
				<!-- TODO: figure out the UI for this
				<span
					class:selected={current}
					class:hover={active}
					style:z-index="1"
					style:position="absolute"
					style:top="0"
					style:left="{left - 4}px"
					style:transform="translateX(-100%)"
				>
					&#8618;
				</span>
				-->

				{#each node.children as child (child.id)}
					<svelte:self node={child} {depth} />
				{/each}
			</ul>
		{:else if node.type === 'slot'}
			<Slot tagName={node.tagName} selected={active} hover={current} bind:expanded={node.expanded}>
				<ul class:active>
					{#each node.children as child (child.id)}
						<svelte:self node={child} depth={depth + 1} />
					{/each}
				</ul>
			</Slot>
		{:else if node.type === 'text'}
			<div style:width="100%">
				<Indexer text={node.detail?.nodeValue} />
			</div>
		{:else if node.type === 'anchor'}
			<div style:width="100%">#anchor</div>
		{/if}
	</li>
{:else}
	{#each node.children as child (child.id)}
		<svelte:self node={child} {depth} />
	{/each}
{/if}

<style>
	li {
		position: relative;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		line-height: 1.5;
		font-size: 0.75rem;
	}
	li :global(div) {
		padding-left: calc(var(--indent) + 6px);
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
		top: 0.2rem;
		bottom: 0.15rem;
		left: calc(var(--indent) - 0.75rem);
		background: #e0e0e2;
	}

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
	}

	li :global(> .selected::after) {
		content: '== $n';
		margin-left: 0.5rem;
	}

	li :global(.hover) {
		background: #f0f9fe;
	}

	:global(.dark) li :global(.hover) {
		background: rgb(53, 59, 72);
	}

	:global(.dark) li :global(.selected),
	:global(.dark) li :global(.selected *),
	:global(.dark) li :global(.hover.selected) {
		background: rgb(32, 78, 138);
	}

	@keyframes flash {
		10% {
			background: rgb(250, 217, 242);
		}
	}
</style>
