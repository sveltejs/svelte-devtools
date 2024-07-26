<script lang="ts">
	interface Props {
		onclick(event: MouseEvent): void;
	}

	let { onclick }: Props = $props();
</script>

<button {onclick}>&bull; &bull; &bull;</button>

<style>
	button {
		align-self: center;
		padding: 0.1rem 0.25rem;
		margin: 0 0.1rem;
		border: 1px solid var(--color);
		border-radius: 1rem;
		background: var(--background);
		color: var(--color);
		font-size: 0.5rem;

		&:hover {
			background: rgba(255, 255, 255, 0.1);
		}
	}
</style>
