<script>
	import BasicTree from './BasicTree/BasicTree.svelte';
	import Detach from './Detach/Detach.svelte';
	import Blocks from './Blocks.svelte';
	import Bind from './Bind/Bind.svelte';
	import Events from './Events/Events.svelte';
	import Slots from './Slots/Slots.svelte';
</script>

<div>
	<BasicTree />
	<Detach />
	<Blocks />
	<Bind />
	<Events />
	<Slots />
</div>

<style>
	div > :global(div) {
		margin-bottom: 1.667rem /* 20px */;
		padding-bottom: 1.667rem /* 20px */;
		border-bottom: 0.083rem /* 1px */ solid lightgray;
	}

	div :global(p) {
		margin: 1.667rem /* 20px */;
		padding: 0.833rem /* 10px */;
		background-color: beige;
	}

	div :global(ol) {
		margin: -1.667rem /* -20px */ 1.667rem /* 20px */ 1.667rem /* 20px */;
		padding-bottom: 0.833rem /* 10px */;
		background-color: beige;
	}

	div :global(ol:first-child) {
		margin-top: 1.667rem /* 20px */;
		padding-top: 0.833rem /* 10px */;
	}
</style>
