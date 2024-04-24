<script lang="ts">
	interface Props {
		children: import('svelte').Snippet;
	}

	let { children }: Props = $props();
</script>

<div>
	{@render children()}
</div>

<style>
	div {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>
