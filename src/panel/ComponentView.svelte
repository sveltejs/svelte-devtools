<script>
	import { devtools } from 'chrome';
	import { selectedNode } from '../store.js';
	import Panel from './Panel.svelte';
	import Toolbar from '../toolbar/Toolbar.svelte';
	import Button from '../toolbar/Button.svelte';
	import PropertyList from './PropertyList.svelte';
</script>

<Panel>
	<div class="root">
		<Toolbar>
			<div class="spacer" />
			<Button
				disabled={$selectedNode.id === undefined}
				on:click={(e) => devtools.inspectedWindow.eval('inspect(window.$s)')}
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
		{#if $selectedNode.type == 'component'}
			<PropertyList
				id={$selectedNode.id}
				header="Props"
				entries={$selectedNode.detail.attributes}
			/>
			<PropertyList id={$selectedNode.id} header="State" entries={$selectedNode.detail.ctx} />
		{:else if $selectedNode.type == 'block' || $selectedNode.type == 'iteration'}
			<PropertyList
				readOnly
				id={$selectedNode.id}
				header="State"
				entries={$selectedNode.detail.ctx}
			/>
		{:else if $selectedNode.type == 'element'}
			<PropertyList
				readOnly
				id={$selectedNode.id}
				header="Attributes"
				entries={$selectedNode.detail.attributes}
			/>
		{/if}
	</div>
</Panel>

<style>
	.root {
		overflow-y: auto;
		flex: 0 0 auto;
		max-height: 100%;
		color: rgb(57, 63, 76);
	}

	.spacer {
		flex-grow: 1;
	}

	:global(.dark) .root {
		background-color: rgb(36, 36, 36);
		color: rgb(177, 177, 179);
	}
</style>
