<script lang="ts">
	import type { Profiler } from '$lib/store';
	import { createEventDispatcher } from 'svelte';

	export let children: Profiler[];
	export let duration: number;

	const dispatch = createEventDispatcher();
</script>

{#if children?.length}
	<ul>
		{#each children as frame}
			<li style="width: {(frame.duration / duration) * 100}%">
				<button class={frame.type} on:click={() => dispatch('click', frame)}>
					<span>&zwnj;</span>
					<span>{frame.node.tagName}</span>
				</button>

				<svelte:self {...frame} on:click={() => dispatch('click', frame)} />
			</li>
		{/each}
	</ul>
{/if}

<style>
	ul {
		display: flex;
	}

	li {
		flex: 0 1 auto;
		min-width: 0.375rem;
	}

	button {
		display: flex;
		overflow: hidden;
		flex-wrap: wrap;
		justify-content: center;
		margin: 1px 0 0 1px;
		height: 2rem;
		color: white;
		line-height: 2rem;
		cursor: pointer;
	}

	button:hover {
		opacity: 0.8;
	}

	.mount {
		background-color: rgb(0, 116, 232);
	}

	.patch {
		background-color: rgb(221, 0, 169);
	}

	.detach {
		background-color: rgb(115, 115, 115);
	}
</style>
