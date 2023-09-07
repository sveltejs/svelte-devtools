<script>
	import Button from '$lib/components/Button.svelte';
	import Divider from '$lib/components/Divider.svelte';
	import Resizable from '$lib/components/Resizable.svelte';
	import Toolbar from '$lib/toolbar/Toolbar.svelte';
	import PropertyList from './PropertyList.svelte';

	import { selectedNode } from '$lib/store';
</script>

<Resizable axis="x">
	<Toolbar>
		<div class="spacer" />

		<Button
			disabled={$selectedNode.id === undefined}
			on:click={() => chrome.devtools.inspectedWindow.eval('inspect(window.$s)')}
		>
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
				<path
					d="M4.5 4a.5.5 0 0 0-.5.5v7c0 .28.22.5.5.5h7a.5.5 0 0 0
            .5-.5v-7a.5.5 0 0 0-.5-.5h-7zM2 4.5A2.5 2.5 0 0 1 4.5 2h7A2.5 2.5 0
            0 1 14 4.5v7a2.5 2.5 0 0 1-2.5 2.5h-7A2.5 2.5 0 0 1 2 11.5v-7M.5
            7.5a.5.5 0 0 0 0 1H2v-1H.5zM14 7.5h1.5a.5.5 0 0 1 0 1H14v-1zM8 0c.28
            0 .5.22.5.5V2h-1V.5c0-.28.22-.5.5-.5zM8.5 14v1.5a.5.5 0 0 1-1
            0V14h1z"
				/>
			</svg>
		</Button>
	</Toolbar>

	{#if $selectedNode.type === 'component'}
		<h2>Props</h2>
		<PropertyList id={$selectedNode.id} entries={$selectedNode.detail.attributes} />

		<Divider type="horizontal" />

		<h2>State</h2>
		<PropertyList id={$selectedNode.id} entries={$selectedNode.detail.ctx} />
	{:else if $selectedNode.type === 'block' || $selectedNode.type === 'iteration'}
		<h2>State</h2>

		<PropertyList readonly id={$selectedNode.id} entries={$selectedNode.detail.ctx} />
	{:else if $selectedNode.type === 'element'}
		<h2>Attributes</h2>

		<PropertyList readonly id={$selectedNode.id} entries={$selectedNode.detail.attributes} />
	{/if}
</Resizable>

<style>
	.spacer {
		flex: 1;
	}

	h2 {
		margin: 0.5rem;
		margin-left: 1rem;
		color: rgb(118, 118, 118);
	}
</style>
