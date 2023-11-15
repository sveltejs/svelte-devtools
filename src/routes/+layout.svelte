<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import Divider from '$lib/components/Divider.svelte';
	import Node from '$lib/nodes/Node.svelte';
	import PropertyList from '$lib/panel/PropertyList.svelte';
	import Resizable from '$lib/components/Resizable.svelte';
	import Toolbar from '$lib/components/Toolbar.svelte';

	import Breadcrumbs from './Breadcrumbs.svelte';
	import ConnectMessage from './ConnectMessage.svelte';
	// import PickerButton from './PickerButton.svelte';
	// import ProfileButton from './ProfileButton.svelte';
	// import Profiler from './Profiler.svelte';
	import SearchBox from './SearchBox.svelte';
	import VisibilitySelection from './VisibilitySelection.svelte';

	import { background } from '$lib/runtime';
	import { hovered, root, selected, visibility } from '$lib/store';

	$: if ($selected) {
		background.send('bridge::ext/select', $selected.id);

		let current = $selected;
		let invalid = null;
		while ((current = current.parent)) {
			if (current.expanded) continue;
			(invalid = current).expanded = true;
		}
		if (invalid) invalid.invalidate();
	} else if ($root.length) {
		selected.set($root[0]);
	}

	function reset() {
		background.send('bridge::ext/highlight', null);
		hovered.set(undefined);
	}
</script>

<svelte:window
	on:keydown={({ target, key }) => {
		if (target !== document.body || !$selected) return;

		if (key === 'Enter') {
			$selected.expanded = !$selected.expanded;
			$selected.invalidate();
		} else if (key === 'ArrowRight') {
			if (!$selected) $selected = $root[0];
			$selected.expanded = true;
			$selected.invalidate();
		} else if (key === 'ArrowLeft') {
			if ($selected.expanded) {
				$selected.expanded = false;
				return $selected.invalidate();
			}
			do $selected = $selected.parent ?? $selected;
			while (!$visibility[$selected.type]);
		} else if (key === 'ArrowUp') {
			let nodes = ($selected.parent?.children || $root).filter((n) => $visibility[n.type]);
			let sibling = nodes[nodes.findIndex((o) => o.id === $selected?.id) - 1];
			while (sibling?.expanded) {
				nodes = sibling.children.filter((n) => $visibility[n.type]);
				sibling = nodes[nodes.length - 1];
			}
			$selected = sibling ?? $selected.parent ?? $selected;
		} else if (key === 'ArrowDown') {
			const children = $selected.children.filter((n) => $visibility[n.type]);

			if (!$selected.expanded || children.length === 0) {
				let next = $selected;
				let current = $selected;
				do {
					const nodes = current.parent ? current.parent.children : $root;
					const siblings = nodes.filter((n) => $visibility[n.type]);
					const index = siblings.findIndex((o) => o.id === current.id);
					next = siblings[index + 1];
					current = current.parent;
				} while (!next && current);

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
			<!-- TODO: reenable profiler -->
			<!-- <ProfileButton /> -->

			<!-- toggle highlighting page elements -->
			<!-- TODO: reenable picker -->
			<!-- <PickerButton /> -->

			<VisibilitySelection />

			<Divider type="vertical" spacing="0.25rem" />
			<SearchBox />
			<Divider type="vertical" spacing="0.25rem" />

			<!-- svelte-ignore missing-declaration -->
			<Button
				disabled={$selected?.id === undefined || $selected?.type !== 'element'}
				on:click={() => chrome.devtools.inspectedWindow.eval('inspect($n).scrollIntoView()')}
			>
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
					<path
						d="M4.5 4a.5.5 0 0 0-.5.5v7c0 .28.22.5.5.5h7a.5.5 0 0 0.5-.5v-7a.5.5 0 0 0-.5-.5h-7zM2 4.5A2.5 2.5 0 0 1 4.5 2h7A2.5 2.5 0 0 1 14 4.5v7a2.5 2.5 0 0 1-2.5 2.5h-7A2.5 2.5 0 0 1 2 11.5v-7M.5 7.5a.5.5 0 0 0 0 1H2v-1H.5zM14 7.5h1.5a.5.5 0 0 1 0 1H14v-1zM8 0c.28 0 .5.22.5.5V2h-1V.5c0-.28.22-.5.5-.5zM8.5 14v1.5a.5.5 0 0 1-1 0V14h1z"
					/>
				</svg>
			</Button>
		</Toolbar>

		<ul on:mousemove|self={reset} on:mouseleave={reset}>
			{#each $root as node (node.id)}
				<Node {node} />
			{/each}
		</ul>

		<Breadcrumbs />
	</main>

	<!-- component details -->
	<Resizable axis="x">
		{@const events = $selected?.detail.listeners?.map((l) => {
			const suffix = l.modifiers?.length ? `|${l.modifiers.join('|')}` : '';
			const value = { __is: 'function', source: l.handler };
			return { key: l.event + suffix, value };
		})}

		{#if $selected?.type === 'component'}
			<h2>Props</h2>
			<PropertyList id={$selected.id} entries={$selected.detail.attributes} />

			<Divider type="horizontal" />

			<h2>Events</h2>
			<PropertyList id={$selected.id} entries={events} />

			<Divider type="horizontal" />

			<h2>State</h2>
			<PropertyList id={$selected.id} entries={$selected.detail.ctx} />
		{:else if $selected?.type === 'block' || $selected?.type === 'iteration'}
			<h2>State</h2>
			<PropertyList readonly id={$selected.id} entries={$selected.detail.ctx} />
		{:else if $selected?.type === 'element'}
			<h2>Attributes</h2>
			<PropertyList readonly id={$selected.id} entries={$selected.detail.attributes} />

			<Divider type="horizontal" />

			<h2>Events</h2>
			<PropertyList id={$selected.id} entries={events} />
		{/if}
	</Resizable>
{:else}
	<ConnectMessage />
{/if}

<style>
	main {
		flex: 1 1 0;
		display: grid;
		grid-template-rows: auto 1fr;
	}

	ul {
		overflow: auto;
	}

	h2 {
		padding-left: 1rem;
		margin: 0;
		color: rgb(118, 118, 118);
	}
</style>
