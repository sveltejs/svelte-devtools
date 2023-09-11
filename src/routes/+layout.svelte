<script lang="ts">
	// import Profiler from '$lib/profiler/Profiler.svelte';

	import Button from '$lib/components/Button.svelte';
	import Toolbar from '$lib/components/Toolbar.svelte';
	import ProfileButton from './ProfileButton.svelte';
	import PickerButton from './PickerButton.svelte';
	import VisibilitySelection from './VisibilitySelection.svelte';
	import ComponentView from '$lib/panel/ComponentView.svelte';
	import Node from '$lib/nodes/Node.svelte';

	import SearchBox from './SearchBox.svelte';
	import Breadcrumbs from './Breadcrumbs.svelte';
	import ConnectMessage from './ConnectMessage.svelte';
	import ReloadExtension from './ReloadExtension.svelte';

	import { background } from '$lib/runtime';
	import { hovered, root, selected, visibility } from '$lib/store';
	import Divider from '$lib/components/Divider.svelte';

	$: if ($selected) {
		background.send('ext/select', $selected.id);

		let current = $selected;
		let invalid = null;
		while ((current = current.parent)) {
			if (current.expanded) continue;
			(invalid = current).expanded = true;
		}
		if (invalid) invalid.invalidate();
	}
</script>

<svelte:window
	on:keydown={({ target, key }) => {
		if (target !== document.body) return;
		if (!$selected?.invalidate) return;

		if (key === 'Enter') {
			$selected.expanded = !$selected.expanded;
			$selected.invalidate();
		} else if (key === 'ArrowRight') {
			$selected.expanded = true;
			$selected.invalidate();
		} else if (key === 'ArrowLeft') {
			$selected.expanded = false;
			$selected.invalidate();
		} else if (key === 'ArrowUp') {
			const nodes = $selected.parent === undefined ? $root : $selected.parent.children;
			const siblings = nodes.filter(
				(o) => $visibility[o.type] && o.type !== 'text' && o.type !== 'anchor',
			);
			const index = siblings.findIndex((o) => o.id === $selected?.id);
			$selected = index > 0 ? siblings[index - 1] : $selected.parent ?? $selected;
		} else if (key === 'ArrowDown') {
			const children = $selected.children.filter(
				(o) => $visibility[o.type] && o.type !== 'text' && o.type !== 'anchor',
			);

			if ($selected.expanded || children.length === 0) {
				let next = $selected;
				let current = $selected;
				do {
					const nodes = current.parent === undefined ? $root : current.parent.children;
					const siblings = nodes.filter(
						(o) => $visibility[o.type] && o.type !== 'text' && o.type !== 'anchor',
					);
					const index = siblings.findIndex((o) => o.id === current.id);
					next = siblings[index + 1];

					current = current.parent;
				} while (next === undefined && current !== undefined);

				$selected = next ?? $selected;
			} else {
				$selected = children[0];
			}
		}
	}}
/>

{#if $root.length}
	<main>
		<!-- <Profiler /> -->

		<Toolbar>
			<ProfileButton />

			<!-- toggle highlighting page elements -->
			<PickerButton />

			<VisibilitySelection />

			<Divider type="vertical" margin="0.25rem" />
			<SearchBox />
			<Divider type="vertical" margin="0.25rem" />

			<!-- svelte-ignore missing-declaration -->
			<Button
				disabled={$selected?.id === undefined}
				on:click={() => {
					chrome.devtools.inspectedWindow.eval('inspect(window.$s)');
				}}
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

		<ul on:mouseleave={() => hovered.set(undefined)}>
			{#each $root as node (node.id)}
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
