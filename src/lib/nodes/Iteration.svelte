<script lang="ts">
	import Ellipsis from './Ellipsis.svelte';

	export let expanded: boolean;
</script>

<div class="expandable">
	<span>&#8618;</span>
	{#if !expanded}
		<Ellipsis on:click={() => (expanded = true)} />
	{/if}
</div>

{#if expanded}
	<slot />
{/if}
