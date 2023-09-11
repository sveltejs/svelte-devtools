<script lang="ts">
	import { query } from '$lib/store';

	export let text = '';

	$: i = text ? text.indexOf($query) : -1;
</script>

{#if i === -1 || $query.length < 2}
	<span>{text}</span>
{:else}
	{@const pre = text.slice(0, i)}
	{@const highlight = text.slice(i, i + $query.length)}
	{@const post = text.slice(i + $query.length)}

	<span>{pre}</span><mark>{highlight}</mark><span>{post}</span>
{/if}
