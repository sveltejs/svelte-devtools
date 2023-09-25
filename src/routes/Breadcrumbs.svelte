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

	let breadcrumbs: NonNullable<typeof $selected>[] = [];
	$: breadcrumbs = trail($selected);
</script>

{#if breadcrumbs.length}
	<ul>
		{#each breadcrumbs as node}
			{#if $visibility[node.type]}
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<!-- svelte-ignore a11y-mouse-events-have-key-events -->
				<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
				<li
					class:selected={node.id === $selected?.id}
					on:click={() => selected.set(node)}
					on:mouseover={() => hovered.set(node)}
				>
					{node.tagName}
				</li>
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

	li {
		cursor: pointer;
		position: relative;
		display: flex;
		align-items: center;
		padding: 0.375rem 0.5rem;
	}
	li:hover {
		background: rgba(255, 255, 255, 0.1);
	}
	li.selected {
		background: rgba(255, 255, 255, 0.05);
	}

	:global(.dark) ul {
		border-top-color: rgb(60, 60, 61);
	}
</style>
