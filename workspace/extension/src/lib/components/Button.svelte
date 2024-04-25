<script lang="ts">
	interface Props {
		type?: 'button' | 'reset' | 'submit';
		disabled?: boolean;
		active?: boolean;
		onclick(event: MouseEvent): void;
		children: import('svelte').Snippet;
	}

	let { type = 'button', disabled = false, active = false, onclick, children }: Props = $props();
</script>

<button {type} {disabled} class:active {onclick}>
	{@render children()}
</button>

<style>
	button {
		z-index: 1;
		cursor: pointer;
		position: relative;

		padding: 0.375rem;
		margin: 0.125rem;
		border: none;
		border-radius: 0.2rem;
		outline: none;

		background-color: transparent;
		color: rgb(12, 12, 13);
		line-height: 0;
	}
	button.active {
		color: rgb(0, 96, 223);
	}
	button:hover {
		background: rgb(237, 237, 240);
	}

	button:active:hover {
		color: inherit;
	}

	button:active {
		color: rgba(12, 12, 13, 0.8);
	}

	button:disabled {
		color: rgba(12, 12, 13, 0.2);
	}

	:global(.dark) button {
		color: rgba(249, 249, 250, 0.7);
	}

	:global(.dark) button.active {
		color: rgb(117, 186, 255);
	}

	:global(.dark) button:hover {
		background-color: rgb(37, 37, 38);
	}

	:global(.dark) button:active {
		color: rgba(249, 249, 250, 0.8);
	}

	:global(.dark) button:disabled {
		color: rgba(249, 249, 250, 0.2);
	}

	:global(.dark) button:disabled,
	button:disabled {
		background-color: transparent;
		cursor: default;
	}

	button :global(svg) {
		width: 1.25rem;
		height: 1.25rem;
		fill: currentColor;
	}
</style>
