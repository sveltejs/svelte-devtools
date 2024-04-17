<script lang="ts">
	interface Props {
		children: import('svelte').Snippet;
	}

	let { children }: Props = $props();
</script>

<nav>
	{@render children()}
</nav>

<style>
	nav {
		display: flex;
		align-items: stretch;
		padding: 0 0.25rem;
		border-bottom: 1px solid rgb(224, 224, 226);
		background-color: rgb(249, 249, 250);
	}

	:global(.dark) nav {
		border-bottom-color: rgb(60, 60, 61);
		background-color: rgb(36, 36, 36);
	}
</style>
