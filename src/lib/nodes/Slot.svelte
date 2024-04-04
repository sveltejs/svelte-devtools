<script lang="ts">
	import Indexer from '../components/Indexer.svelte';
	import Ellipsis from './Ellipsis.svelte';

	interface Props {
		tagName: string;
		expanded: boolean;
		children: import('svelte').Snippet;
	}

	let { tagName, expanded, children }: Props = $props();
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class:expanded class="expandable tag-open tag-name" ondblclick={() => (expanded = !expanded)}>
	<Indexer text="<{tagName}>" color="#c586c0" />

	{#if !expanded}
		<Ellipsis onclick={() => (expanded = true)} />
		<Indexer text="</{tagName}>" color="#c586c0" />
	{/if}
</div>
{#if expanded}
	{@render children()}

	<div>
		<Indexer text="</{tagName}>" color="#c586c0" />
	</div>
{/if}
