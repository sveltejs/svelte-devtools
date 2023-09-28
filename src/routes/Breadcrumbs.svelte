<script lang="ts">
	import { selected, hovered, visibility } from '$lib/store';

	function trail(node: typeof $selected) {
		const ancestors = [];
		while (node && node.tagName) {
			ancestors.push(node);
			node = node.parent;
		}
		return ancestors.reverse();
	}

	$: breadcrumbs = trail($selected);
</script>

{#if breadcrumbs.length}
	<ul>
		{#each breadcrumbs as node}
			{#if $visibility[node.type]}
				<button
					class:selected={node.id === $selected?.id}
					on:click={() => selected.set(node)}
					on:focus={() => hovered.set(node)}
					on:mouseover={() => hovered.set(node)}
				>
					{node.tagName}
				</button>
			{/if}
		{/each}
	</ul>
{/if}

<style>
	ul {
		overflow: auto;
		display: flex;
		align-items: center;
		border-top: 1px solid rgb(224, 224, 226);
		font-size: 0.75rem;
	}

	button {
		cursor: pointer;
		position: relative;
		display: flex;
		align-items: center;
		padding: 0.375rem 0.5rem;
		border: none;
		background: var(--background);
		color: var(--color);
		font-size: inherit;
	}
	button:hover {
		background: rgba(255, 255, 255, 0.1);
	}
	button.selected {
		background: rgba(255, 255, 255, 0.05);
	}

	:global(.dark) ul {
		border-top-color: rgb(60, 60, 61);
	}
</style>
