<script lang="ts">
	export let style: string;
</script>

<div {style}>#anchor</div>

<style>
	div {
		color: rgb(151, 164, 179);
	}

	:global(.dark) div {
		color: rgb(175, 181, 191);
	}
</style>
