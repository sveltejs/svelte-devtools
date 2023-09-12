<script>
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	export let frame;
</script>

<div class={frame.type} on:click={() => dispatch('click', frame)}>
	&zwnj;
	<span>{frame.node.tagName}</span>
</div>

<style>
	div {
		display: flex;
		overflow: hidden;
		flex-wrap: wrap;
		justify-content: center;
		margin: 0.083rem /* 1px */ 0 0 0.083rem /* 1px */;
		height: 2rem;
		color: white;
		line-height: 2rem;
		cursor: pointer;
	}

	div:hover {
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
