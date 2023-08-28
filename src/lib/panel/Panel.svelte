<script>
	export let grow = 'left';

	let resizing = false;
	let size = 300;
</script>

<svelte:window
	on:mouseup={() => (resizing = false)}
	on:mousemove={(e) => {
		if (!resizing) return;
		size = grow == 'left' ? window.innerWidth - e.x : window.innerHeight - e.y;
	}}
/>

<div style="{grow == 'left' ? 'width' : 'height'}: {size}px">
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div class="{grow} resize" on:mousedown={() => (resizing = true)} />

	<slot />
</div>

<style>
	div {
		position: relative;
	}

	.resize.left {
		position: absolute;
		top: 0;
		bottom: 0;
		left: 0;
		width: 0.417rem /* 5px */;
		border-left: 0.083rem /* 1px */ solid rgb(224, 224, 226);
		cursor: ew-resize;
	}

	.resize.up {
		position: absolute;
		top: 0;
		right: 0;
		left: 0;
		height: 0.417rem /* 5px */;
		border-top: 0.083rem /* 1px */ solid rgb(224, 224, 226);
		cursor: ns-resize;
	}

	.resize:hover {
		border-color: rgb(177, 177, 179);
	}

	:global(.dark) .resize {
		border-color: rgb(60, 60, 61);
	}

	:global(.dark) .resize:hover {
		border-color: rgb(107, 107, 108);
	}
</style>
