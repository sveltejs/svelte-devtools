<script lang="ts">
	import Indexer from '../components/Indexer.svelte';
	import Ellipsis from './Ellipsis.svelte';

	interface Props {
		tagName: string;
		expanded: boolean;
	}

	let { tagName, expanded }: Props = $props();
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class:expanded class="expandable tag-open tag-name" on:dblclick={() => (expanded = !expanded)}>
	<Indexer text={`<${tagName}>`} color="#c586c0" />

	{#if !expanded}
		<Ellipsis onclick={() => (expanded = true)} />
		<Indexer text={`</${tagName}>`} color="#c586c0" />
	{/if}
</div>
{#if expanded}
	<slot />

	<div>
		<Indexer text={`</${tagName}>`} color="#c586c0" />
	</div>
{/if}
