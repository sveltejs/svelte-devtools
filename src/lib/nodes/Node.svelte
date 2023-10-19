<script lang="ts">
	import Indexer from '$lib/components/Indexer.svelte';
	import Element from './Element.svelte';
	import Block from './Block.svelte';
	import Slot from './Slot.svelte';

	import { background } from '$lib/runtime';
	import { hovered, selected, visibility } from '$lib/store';

	export let node: NonNullable<typeof $selected>;
	export let depth = 1;

	node.invalidate = () => (node = node);

	function invisible(n: typeof node): boolean {
		return !$visibility[n.type] && n.children.every(invisible);
	}

	let lastLength = node.children.length;
	let flash = false;
	$: {
		flash = flash || node.children.length !== lastLength;
		lastLength = node.children.length;
	}
</script>

{#if $visibility[node.type]}
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
	<li
		class:flash
		style:--indent="{depth * 12}px"
		data-current={$selected?.id === node.id || null}
		data-hovered={$hovered?.id === node.id || null}
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
				attributes={node.detail?.attributes || []}
				listeners={node.detail?.listeners || []}
				empty={!node.children.length || node.children.every(invisible)}
				bind:expanded={node.expanded}
			>
				<ul>
					{#each node.children as child (child.id)}
						<svelte:self node={child} depth={depth + 1} />
					{/each}
				</ul>
			</Element>
		{:else if node.type === 'block'}
			<Block tagName={node.tagName} source={node.detail?.source} bind:expanded={node.expanded}>
				<ul>
					{#each node.children as child (child.id)}
						<svelte:self node={child} depth={depth + 1} />
					{/each}
				</ul>
			</Block>
		{:else if node.type === 'iteration'}
			<ul>
				<!-- TODO: figure this out
				<span
					class:selected={current}
					class:hover={active}
					style:z-index="1"
					style:position="absolute"
					style:left="{left - 4}px"
					style:transform="translateX(-100%)"
				>
					&#8618;
				</span>
				-->

				{#each node.children as child (child.id)}
					<svelte:self node={child} depth={depth + 1} />
				{/each}
			</ul>
		{:else if node.type === 'slot'}
			<Slot tagName={node.tagName} bind:expanded={node.expanded}>
				<ul>
					{#each node.children as child (child.id)}
						<svelte:self node={child} depth={depth + 1} />
					{/each}
				</ul>
			</Slot>
		{:else if node.type === 'text'}
			<div>
				<Indexer text={node.detail?.nodeValue} />
			</div>
		{:else if node.type === 'anchor'}
			<div>#anchor</div>
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
	ul {
		width: 100%;
		position: relative;
	}

	li :global(div) {
		width: 100%;
		display: flex;
		flex-wrap: wrap;
		padding-left: calc(var(--indent) + 6px);
	}
	li[data-hovered] > :global(div) {
		background: #f0f9fe;
	}
	li[data-current] > ul::before {
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

	li[data-current] > :global(div:first-child),
	li[data-current][data-hovered] > :global(div) {
		background: rgb(0, 116, 232);
	}
	li[data-current] > :global(div:first-child:after) {
		content: '== $n';
		margin-left: 0.5rem;
	}

	:global(.dark) li[data-hovered] > :global(div) {
		background: rgb(53, 59, 72);
	}

	:global(.dark) li[data-current] > :global(div:first-child),
	:global(.dark) li[data-current][data-hovered] > :global(div) {
		background: rgb(32, 78, 138);
	}

	@keyframes flash {
		10% {
			background: rgb(250, 217, 242);
		}
	}
</style>
