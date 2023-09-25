<script lang="ts">
	export let type: 'horizontal' | 'vertical';
	export let spacing: `${string}rem` = '0rem';
</script>

<div class={type} style="--spacing: {spacing}"></div>

<style>
	div {
		background: rgb(224, 224, 226);
	}
	.horizontal {
		width: 100%;
		height: 1px;
		margin: var(--spacing, 0) 0;
	}
	.vertical {
		width: 1px;
		height: 100%;
		margin: 0 var(--spacing, 0);
	}

	:global(.dark) div {
		background: rgb(60, 60, 61);
	}
</style>
