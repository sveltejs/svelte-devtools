<script lang="ts">
	import Indexer from '$lib/components/Indexer.svelte';
	import Block from './Block.svelte';
	import Element from './Element.svelte';
	import Iteration from './Iteration.svelte';
	import Node from './Node.svelte';
	import Slot from './Slot.svelte';

	import { background } from '$lib/runtime.svelte';
	import { app, visibility } from '$lib/state.svelte';

	interface Props {
		node: NonNullable<typeof app.selected>;
		depth?: number;
	}

	let { node, depth = 1 }: Props = $props();

	const prev = $state(node);

	function invisible(n: typeof node): boolean {
		return !visibility[n.type] && n.children.every(invisible);
	}
</script>

{#snippet expand(children: (typeof node)['children'], level: number)}
	{#each children as child (child.id)}
		<Node node={child} depth={level} />
	{/each}
{/snippet}

{#if visibility[node.type]}
	<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
	<li
		bind:this={node.dom}
		style:--indent="{depth * 12}px"
		class:flash={prev.id !== node.id ||
			prev.source !== node.source ||
			prev.children.length !== node.children.length}
		data-current={app.selected?.id === node.id || null}
		data-hovered={app.hovered?.id === node.id || null}
		onanimationend={() => Object.assign(prev, node)}
		onclick={(event) => {
			event.stopPropagation();
			app.selected = node;
		}}
		onmousemove={(event) => {
			event.stopPropagation();
			if (app.hovered?.id === node.id) return;
			background.send('bridge::ext/highlight', node.id);
			app.hovered = node;
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
				<ul>{@render expand(node.children, depth + 1)}</ul>
			</Element>
		{:else if node.type === 'block'}
			<Block tagName={node.tagName} source={node.detail.source} bind:expanded={node.expanded}>
				<ul>{@render expand(node.children, depth + 1)}</ul>
			</Block>
		{:else if node.type === 'iteration'}
			<Iteration bind:expanded={node.expanded}>
				<ul>{@render expand(node.children, depth + 1)}</ul>
			</Iteration>
		{:else if node.type === 'slot'}
			<Slot tagName={node.tagName} bind:expanded={node.expanded}>
				<ul>{@render expand(node.children, depth + 1)}</ul>
			</Slot>
		{:else if node.type === 'text'}
			<div>
				<Indexer text={node.detail.nodeValue} />
			</div>
		{:else if node.type === 'anchor'}
			<div>#anchor</div>
		{/if}
	</li>
{:else}
	{@render expand(node.children, depth)}
{/if}

<style>
	li {
		position: relative;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		line-height: 1.5;
		font-size: 0.75rem;

		ul {
			width: 100%;
			position: relative;
		}

		&[data-hovered] > :global(div) {
			background: #f0f9fe;
		}

		&[data-current] {
			& > ul::before {
				content: '';
				z-index: 1;
				width: 0.125rem;
				position: absolute;
				top: 0.2rem;
				bottom: 0.15rem;
				left: calc(var(--indent) - 0.75rem);
				background: #e0e0e2;
			}

			& > :global(div:first-child),
			&[data-hovered] > :global(div) {
				background: rgb(0, 116, 232);
			}

			& > :global(div:first-child:after) {
				content: '== $n';
				margin-left: 0.5rem;
			}
		}

		& :global(div) {
			width: 100%;
			display: flex;
			flex-wrap: wrap;
			padding-left: calc(var(--indent) + 6px);
		}
	}

	:global(.dark) {
		li[data-hovered] > :global(div) {
			background: rgb(53, 59, 72);
		}

		li[data-current] > :global(div:first-child),
		li[data-current][data-hovered] > :global(div) {
			background: rgb(32, 78, 138);
		}
	}

	/* flash animation for updates */
	li.flash > :global(:first-child),
	li.flash > :global(:first-child *),
	li :global(.flash),
	li :global(.flash *) {
		animation: flash 800ms ease-in-out;
	}

	@keyframes flash {
		10% {
			background: rgb(250, 217, 242);
		}
	}
</style>
