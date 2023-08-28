<script>
	import { hoveredNodeId, rootNodes, profilerEnabled } from './store.js';
	import Toolbar from './toolbar/Toolbar.svelte';
	import Search from './toolbar/Search.svelte';
	import ProfileButton from './toolbar/ProfileButton.svelte';
	import PickerButton from './toolbar/PickerButton.svelte';
	import VisibilityButton from './toolbar/VisibilityButton.svelte';
	import ComponentView from './panel/ComponentView.svelte';
	import Profiler from './profiler/Profiler.svelte';
	import Breadcrumbs from './Breadcrumbs.svelte';
	import ConnectMessage from './ConnectMessage.svelte';
	import Node from './nodes/Node.svelte';
</script>

{#if $profilerEnabled}
	<div>
		<Profiler />
	</div>
{:else if $rootNodes.length}
	<div class="node-tree">
		<Toolbar>
			<ProfileButton />
			<PickerButton />
			<VisibilityButton />
			<Search />
		</Toolbar>
		<ul on:mouseleave={(e) => ($hoveredNodeId = null)}>
			{#each $rootNodes as node (node.id)}
				<Node {node} />
			{/each}
		</ul>
		<Breadcrumbs />
	</div>
	<ComponentView />
{:else}
	<ConnectMessage />
{/if}

<style>
	div {
		display: flex;
		overflow: hidden;
		flex: 1 1 0;
		flex-direction: column;
	}

	ul {
		overflow: auto;
		flex-grow: 1;
		padding-top: 0.583rem; /* 8px */
	}
</style>
