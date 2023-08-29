<script lang="ts">
	import { tick } from 'svelte';
	import { selectedNode, hoveredNodeId, visibility } from '$lib/store';

	let root: undefined | HTMLUListElement;
	let breadcrumbs: Array<{ id: number; type: string; tagName: string }> = [];
	let shorttend;

	async function setSelectedBreadcrumb(node) {
		if (breadcrumbs.find((o) => o.id == node.id)) return;

		breadcrumbs = [];
		while (node && node.tagName) {
			breadcrumbs.unshift(node);
			node = node.parent;
		}

		shorttend = false;

		await tick();
		while (root && root.scrollWidth > root.clientWidth) {
			breadcrumbs.shift();
			shorttend = true;
			breadcrumbs = breadcrumbs;
			await tick();
		}
	}

	$: setSelectedBreadcrumb($selectedNode);
</script>

{#if breadcrumbs.length > 1}
	<ul bind:this={root}>
		{#if shorttend}
			<li>
				&hellip;
				<div />
			</li>
		{/if}
		{#each breadcrumbs as node}
			{#if $visibility[node.type]}
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<!-- svelte-ignore a11y-mouse-events-have-key-events -->
				<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
				<li
					class:selected={node.id == $selectedNode.id}
					on:click={() => ($selectedNode = node)}
					on:mouseover={() => ($hoveredNodeId = node.id)}
				>
					{node.tagName}
					<div />
				</li>
			{/if}
		{/each}
	</ul>
{/if}

<style>
	ul {
		display: flex;
		align-items: center;
		height: 1.667rem; /* 22px */
		border-top: 1px solid rgb(224, 224, 226);
	}

	li {
		display: flex;
		align-items: center;
		padding-left: 0.75rem; /* 10px */
		cursor: pointer;
	}

	li.selected {
		color: rgb(0, 116, 232);
	}

	li:hover {
		opacity: 0.8;
	}

	li:last-child {
		padding-right: 0.75rem; /* 10px */
	}

	li:last-child div {
		display: none;
	}

	div {
		position: relative;
		margin-left: 0.75rem; /* 10px */
		width: 0;
		height: 0;
		border-top: 0.25rem solid transparent; /* 3.5px */
		border-bottom: 0.25rem solid transparent; /* 3.5px */
		border-left: 0.417rem solid #8e8eb2; /* 5px */
	}

	div::after {
		position: absolute;
		top: -0.25rem; /* -3.5px */
		left: -0.417rem; /* -5px */
		display: block;
		width: 0;
		height: 0;
		border-top: 0.25rem solid transparent; /* 3.5px */
		border-bottom: 0.25rem solid transparent; /* 3.5px */
		border-left: 0.167rem solid #ffffff; /* 2px */
		content: '';
	}

	:global(.dark) ul {
		border-top-color: rgb(60, 60, 61);
	}

	:global(.dark) div::after {
		border-left-color: rgba(135, 135, 137, 0.9);
	}
</style>
