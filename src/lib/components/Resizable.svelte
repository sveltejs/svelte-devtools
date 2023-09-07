<script lang="ts">
	export let axis: 'x' | 'y';

	let resizing = false;
	let size = 500;
</script>

<svelte:window
	on:mouseup={() => (resizing = false)}
	on:mousemove={({ pageX: x, pageY: y }) => {
		if (!resizing) return;
		size = axis === 'x' ? window.innerWidth - x : window.innerHeight - y;
	}}
/>

<aside style="{axis === 'x' ? 'width' : 'height'}: {size}px">
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div class="{axis} resize" on:mousedown={() => (resizing = true)} />

	<slot />
</aside>

<style>
	aside {
		position: relative;
		color: rgb(57, 63, 76);
	}

	.resize {
		position: absolute;
		top: 0;
		left: 0;
		width: 0.2rem;
		background: rgb(224, 224, 226);
	}
	.resize.x {
		bottom: 0;
		width: 0.2rem;
		cursor: ew-resize;
	}
	.resize.y {
		right: 0;
		height: 0.2rem;
		cursor: ns-resize;
	}
	.resize.x:hover {
		width: 0.25rem;
		background: rgb(177, 177, 179);
	}
	.resize.y:hover {
		width: 0.25rem;
		background: rgb(177, 177, 179);
	}

	:global(.dark) aside {
		background: rgb(36, 36, 36);
		color: rgb(177, 177, 179);
	}
	:global(.dark) .resize {
		background: rgb(60, 60, 61);
	}
	:global(.dark) .resize:hover {
		background: rgb(107, 107, 108);
	}
</style>
