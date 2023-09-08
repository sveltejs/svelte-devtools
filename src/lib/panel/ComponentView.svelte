<script>
	import Divider from '$lib/components/Divider.svelte';
	import Resizable from '$lib/components/Resizable.svelte';
	import PropertyList from './PropertyList.svelte';

	import { selected } from '$lib/store';
</script>

<Resizable axis="x">
	{#if $selected?.type === 'component'}
		<h2>Props</h2>
		<PropertyList id={$selected.id} entries={$selected.detail.attributes} />

		<Divider type="horizontal" />

		<h2>State</h2>
		<PropertyList id={$selected.id} entries={$selected.detail.ctx} />
	{:else if $selected?.type === 'block' || $selected?.type === 'iteration'}
		<h2>State</h2>

		<PropertyList readonly id={$selected.id} entries={$selected.detail.ctx} />
	{:else if $selected?.type === 'element'}
		<h2>Attributes</h2>

		<PropertyList readonly id={$selected.id} entries={$selected.detail.attributes} />
	{/if}
</Resizable>

<style>
	h2 {
		margin: 0.5rem;
		margin-left: 1rem;
		color: rgb(118, 118, 118);
	}
</style>
