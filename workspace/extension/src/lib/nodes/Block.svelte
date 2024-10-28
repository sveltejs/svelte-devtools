<script lang="ts">
	import Indexer from '../components/Indexer.svelte';
	import Ellipsis from './Ellipsis.svelte';

	interface Props {
		tagName: string;
		source?: string;
		expanded: boolean;
		children: import('svelte').Snippet;
	}

	let { tagName, source, expanded = $bindable(), children }: Props = $props();
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class:expanded class="expandable tag-open tag-name" ondblclick={() => (expanded = !expanded)}>
	{#if source}
		<span>{source}</span>
	{:else}
		<Indexer text={`{#${tagName}}`} />
	{/if}
	{#if !expanded}
		<Ellipsis onclick={() => (expanded = true)} />
		<Indexer text={`{/${tagName}}`} />
	{/if}
</div>
{#if expanded}
	{@render children()}

	<div>
		<Indexer text={`{/${tagName}}`} />
	</div>
{/if}

<style>
	div {
		color: rgb(151, 164, 179);
	}

	:global(.dark) div {
		color: rgb(175, 181, 191);
	}
</style>
