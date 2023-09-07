<script>
	// import Profiler from '$lib/profiler/Profiler.svelte';

	import Toolbar from '$lib/toolbar/Toolbar.svelte';
	import Search from '$lib/toolbar/Search.svelte';
	import ProfileButton from '$lib/toolbar/ProfileButton.svelte';
	import PickerButton from '$lib/toolbar/PickerButton.svelte';
	import VisibilitySelection from '$lib/toolbar/VisibilitySelection.svelte';
	import ComponentView from '$lib/panel/ComponentView.svelte';
	import Node from '$lib/nodes/Node.svelte';

	import Breadcrumbs from './Breadcrumbs.svelte';
	import ConnectMessage from './ConnectMessage.svelte';
	import ReloadExtension from './ReloadExtension.svelte';

	import { hoveredNodeId, rootNodes } from '$lib/store';
</script>

{#if $rootNodes.length}
	<main>
		<!-- <Profiler /> -->

		<Toolbar>
			<ProfileButton />
			<PickerButton />
			<VisibilitySelection />
			<Search />
		</Toolbar>

		<ul on:mouseleave={() => ($hoveredNodeId = -1)}>
			{#each $rootNodes as node (node.id)}
				<Node {node} />
			{/each}
		</ul>

		<Breadcrumbs />
	</main>

	<ComponentView />
{:else}
	<ConnectMessage />
{/if}

<ReloadExtension />

<style>
	main {
		flex: 1 1 0;
		display: grid;
		grid-template-rows: auto 1fr;
	}

	ul {
		overflow: auto;
		padding-top: 0.5rem;
	}
</style>
