<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	export let frame: {
		type: 'mount' | 'patch' | 'detach';
		node: { tagName: string };
	};
</script>

<button class={frame.type} on:click={() => dispatch('click', frame)}>
	&zwnj;
	<span>{frame.node.tagName}</span>
</button>

<style>
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
