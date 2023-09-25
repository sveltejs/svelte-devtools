<script>
	import { background } from '$lib/runtime';
</script>

<button
	type="button"
	on:click={() => {
		background.send('ext/reload');
		location.reload();
	}}
>
	<svg
		width="24"
		height="24"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
	>
		<path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
		<path d="M21 3v5h-5" />
	</svg>
</button>

<style>
	button {
		cursor: pointer;
		position: fixed;
		bottom: 0;
		right: 0;
		width: 2.5rem;
		height: 2.5rem;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border-radius: 20%;
		color: var(--color);
		background: var(--background, rgba(0, 0, 0, 0.25));
		transform: translate(-50%, -50%);
	}
</style>
