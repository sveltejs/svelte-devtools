<script>
	import ComponentView from '$lib/panel/ComponentView.svelte';
	import Node from '$lib/nodes/Node.svelte';
	import PickerButton from '$lib/toolbar/PickerButton.svelte';
	import ProfileButton from '$lib/toolbar/ProfileButton.svelte';
	import Profiler from '$lib/profiler/Profiler.svelte';
	import Search from '$lib/toolbar/Search.svelte';
	import Toolbar from '$lib/toolbar/Toolbar.svelte';
	import VisibilityButton from '$lib/toolbar/VisibilityButton.svelte';

	import Breadcrumbs from './Breadcrumbs.svelte';
	import ConnectMessage from './ConnectMessage.svelte';

	import { hoveredNodeId, rootNodes, profilerEnabled } from '$lib/store';
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
		<ul on:mouseleave={() => ($hoveredNodeId = null)}>
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
