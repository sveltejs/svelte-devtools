<script lang="ts">
	import Ellipsis from './Ellipsis.svelte';

	interface Props {
		expanded: boolean;
		children: import('svelte').Snippet;
	}

	let { expanded = $bindable(), children }: Props = $props();
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="expandable" ondblclick={() => (expanded = !expanded)}>
	<span>&#8618;</span>
	{#if !expanded}
		<Ellipsis onclick={() => (expanded = true)} />
	{/if}
</div>

{#if expanded}
	{@render children()}
{/if}
