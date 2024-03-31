<script lang="ts">
	import { app, visibility } from '$lib/state.svelte';

	const breadcrumbs = $derived.by(() => {
		const ancestors = [];
		let parent = app.selected;
		while (parent && parent.tagName) {
			ancestors.push(parent);
			parent = parent.parent;
		}
		return ancestors.reverse();
	});
</script>

{#if breadcrumbs.length}
	<ul>
		{#each breadcrumbs as node}
			{#if visibility[node.type]}
				<button
					class:selected={node.id === app.selected?.id}
					onclick={() => (app.selected = node)}
					onfocus={() => (app.hovered = node)}
					onmouseover={() => (app.hovered = node)}
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
