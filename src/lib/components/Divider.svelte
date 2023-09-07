<script lang="ts">
	export let type: 'horizontal' | 'vertical';
</script>

<div class={type}></div>

<style>
	div {
		background: #3c3c3d;
	}
	.horizontal {
		width: 100%;
		height: 1px;
	}
	.vertical {
		width: 1px;
		height: 100%;
	}
</style>
