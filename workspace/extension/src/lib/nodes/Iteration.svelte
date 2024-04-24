<script lang="ts">
	import Ellipsis from './Ellipsis.svelte';

	interface Props {
		expanded: boolean;
		children: import('svelte').Snippet;
	}

	let { expanded, children }: Props = $props();
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="expandable" ondblclick={() => (expanded = !expanded)}>
	<span>&#8618;</span>
	{#if !expanded}
		<Ellipsis onclick={() => (expanded = true)} />
	{/if}
</div>

{#if expanded}
	{@render children()}
{/if}
