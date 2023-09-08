<script lang="ts">
	import { query } from '$lib/store';

	export let text: string;

	$: i = text ? text.indexOf($query) : -1;
	$: pre = text ? text.substring(0, i) : '';
	$: highlight = text ? text.substring(i, i + $query.length) : '';
	$: post = text ? text.substring(i + $query.length) : '';
</script>

{#if i === -1 || $query.length < 2}{text}{:else}{pre}<mark>{highlight}</mark>{post}{/if}
