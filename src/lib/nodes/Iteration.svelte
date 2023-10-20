<script lang="ts">
	import Ellipsis from './Ellipsis.svelte';

	export let expanded: boolean;
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="expandable" on:dblclick={() => (expanded = !expanded)}>
	<span>&#8618;</span>
	{#if !expanded}
		<Ellipsis on:click={() => (expanded = true)} />
	{/if}
</div>

{#if expanded}
	<slot />
{/if}
