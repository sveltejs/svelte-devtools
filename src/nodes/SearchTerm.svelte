<script>
	import { searchValue } from '../store.js';

	export let text;

	$: i = text ? text.indexOf($searchValue) : -1;
	$: pre = text ? text.substring(0, i) : '';
	$: highlight = text ? text.substring(i, i + $searchValue.length) : '';
	$: post = text ? text.substring(i + $searchValue.length) : '';
</script>

{#if i == -1 || $searchValue.length < 2}
	{text}
{:else}{pre}<span>{highlight}</span>{post}{/if}

<style>
	span {
		background-color: yellow !important;
		color: black !important;
	}
</style>
