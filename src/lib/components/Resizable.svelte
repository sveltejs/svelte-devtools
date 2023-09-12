<script lang="ts">
	export let axis: 'x' | 'y';

	let resizing = false;
	let size = 425;
</script>

<svelte:window
	on:mouseup={() => (resizing = false)}
	on:mousemove={({ pageX: x, pageY: y }) => {
		if (!resizing) return;
		size = axis === 'x' ? window.innerWidth - x : window.innerHeight - y;
	}}
/>

<aside class={axis} style="{axis === 'x' ? 'width' : 'height'}: {size}px">
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div class="{axis} resize" on:mousedown={() => (resizing = true)} />

	<div><slot /></div>
</aside>

<style>
	aside {
		position: relative;
		display: grid;
		color: rgb(57, 63, 76);
	}
	aside.x {
		grid-template-columns: auto 1fr;
	}
	aside.y {
		grid-template-rows: auto 1fr;
	}

	.resize {
		top: 0;
		left: 0;
		width: 0.25rem;
		background: rgb(224, 224, 226);
	}
	.resize:hover {
		background: rgb(177, 177, 179);
	}
	.resize.x {
		cursor: ew-resize;
		bottom: 0;
		width: 0.2rem;
	}
	.resize.y {
		cursor: ns-resize;
		right: 0;
		height: 0.2rem;
	}
	.resize + div {
		display: grid;
		gap: 0.625rem;
		align-content: flex-start;
		padding-top: 1rem;
	}
	.resize.x + div {
		overflow-x: hidden;
	}
	.resize.y + div {
		overflow-y: hidden;
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
