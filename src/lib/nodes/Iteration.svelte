<script lang="ts">
	import Ellipsis from './Ellipsis.svelte';

	export let selected: boolean;
	export let expanded: boolean;
</script>

<div class:selected class="expandable">
	<span>&#8618;</span>
	{#if !expanded}
		<Ellipsis on:click={() => (expanded = true)} />
	{/if}
</div>

{#if expanded}
	<slot />
{/if}
