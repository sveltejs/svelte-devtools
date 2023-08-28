<script>
	import SearchTerm from './SearchTerm.svelte';

	export let style;
	export let nodeValue;
</script>

<div {style}>
	<SearchTerm text={nodeValue} />
</div>
