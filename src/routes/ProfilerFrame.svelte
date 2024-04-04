<script lang="ts">
	interface Profiler {
		type: 'mount' | 'patch' | 'detach';
		node: import('$lib/state.svelte').DebugNode;
		duration: number;
		start: number;
		end: number;
		children: Profiler[];
	}

	interface Props {
		children: Profiler[];
		duration: number;
		onclick(frame: Profiler): void;
	}

	let { children, duration, onclick }: Props = $props();
</script>

{#if children?.length}
	<ul>
		{#each children as frame}
			<li style="width: {(frame.duration / duration) * 100}%">
				<button class={frame.type} onclick={() => onclick(frame)}>
					<span>&zwnj;</span>
					<span>{frame.node.tagName}</span>
				</button>

				<svelte:self {...frame} onclick={() => onclick(frame)} />
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
