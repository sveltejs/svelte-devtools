<script>
	import Toolbar from '$lib/toolbar/Toolbar.svelte';
	import Search from '$lib/toolbar/Search.svelte';
	import ProfileButton from '$lib/toolbar/ProfileButton.svelte';
	import PickerButton from '$lib/toolbar/PickerButton.svelte';
	import VisibilityButton from '$lib/toolbar/VisibilityButton.svelte';
	import ComponentView from '$lib/panel/ComponentView.svelte';
	import Node from '$lib/nodes/Node.svelte';

	import Breadcrumbs from './Breadcrumbs.svelte';

	import { hoveredNodeId, rootNodes } from '$lib/store';
</script>

<header>
	<Toolbar>
		<ProfileButton />
		<PickerButton />
		<VisibilityButton />
		<Search />
	</Toolbar>

	<ul on:mouseleave={() => ($hoveredNodeId = -1)}>
		{#each $rootNodes as node (node.id)}
			<Node {node} />
		{/each}
	</ul>

	<Breadcrumbs />
</header>

<ComponentView />

<style>
	header {
		overflow: hidden;
		display: flex;
		flex: 1 1 0;
		flex-direction: column;
	}

	ul {
		overflow: auto;
		flex-grow: 1;
		padding-top: 0.5rem;
	}
</style>
