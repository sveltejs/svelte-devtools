<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import Divider from '$lib/components/Divider.svelte';
	import Node from '$lib/nodes/Node.svelte';
	import PropertyList from '$lib/panel/PropertyList.svelte';
	import Resizable from '$lib/components/Resizable.svelte';
	import Toolbar from '$lib/components/Toolbar.svelte';

	import Breadcrumbs from './routes/Breadcrumbs.svelte';
	import ConnectMessage from './routes/ConnectMessage.svelte';
	import Inspector from './routes/Inspector.svelte';
	import SearchBox from './routes/SearchBox.svelte';
	import VisibilitySelection from './routes/VisibilitySelection.svelte';

	import { background } from '$lib/runtime.svelte';
	import { app, visibility } from '$lib/state.svelte';

	let container = $state<undefined | HTMLElement>();

	$effect(() => {
		if (app.selected) {
			background.send('bridge::ext/select', app.selected.id);

			let current = app.selected;
			while ((current = current.parent)) {
				current.expanded = true;
			}

			// scroll selected node into view
			if (app.selected.dom && container) {
				const { top: start, height } = container.getBoundingClientRect();
				const top = app.selected.dom.getBoundingClientRect().top - start;
				if (top >= 0 && top + 24 <= height) return; // node is in view
				app.selected.dom.scrollIntoView({
					block: top < 0 || height / 2 - top >= 0 ? 'start' : 'end',
				});
			}
		} else if (app.root.length) {
			app.selected = app.root[0];
		}
	});

	function reset() {
		background.send('bridge::ext/highlight', null);
		app.hovered = undefined;
	}
</script>

<svelte:window
	onkeydown={(event) => {
		const { target, key } = event;
		if (target !== document.body || !app.selected) return;

		if (key === 'Enter') {
			app.selected.expanded = !app.selected.expanded;
		} else if (key === 'ArrowRight') {
			event.preventDefault();
			if (!app.selected) app.selected = app.root[0];
			app.selected.expanded = true;
		} else if (key === 'ArrowLeft') {
			event.preventDefault();
			if (app.selected.expanded) {
				app.selected.expanded = false;
				return;
			}
			do app.selected = app.selected.parent ?? app.selected;
			while (!visibility[app.selected.type]);
		} else if (key === 'ArrowUp') {
			event.preventDefault();
			let nodes = (app.selected.parent?.children || app.root).filter((n) => visibility[n.type]);
			let sibling = nodes[nodes.findIndex((o) => o.id === app.selected?.id) - 1];
			while (sibling?.expanded) {
				nodes = sibling.children.filter((n) => visibility[n.type]);
				sibling = nodes[nodes.length - 1];
			}
			app.selected = sibling ?? app.selected.parent ?? app.selected;
		} else if (key === 'ArrowDown') {
			event.preventDefault();
			const children = app.selected.children.filter((n) => visibility[n.type]);

			if (!app.selected.expanded || children.length === 0) {
				let next = app.selected;
				let current = app.selected;
				do {
					const nodes = current.parent ? current.parent.children : app.root;
					const siblings = nodes.filter((n) => visibility[n.type]);
					const index = siblings.findIndex((o) => o.id === current.id);
					next = siblings[index + 1];
					current = current.parent;
				} while (!next && current);

				app.selected = next ?? app.selected;
			} else {
				app.selected = children[0];
			}
		}
	}}
/>

{#if app.root.length}
	<main>
		<!-- <Profiler /> -->

		<Toolbar>
			<!-- TODO: reenable profiler -->
			<!-- <ProfileButton /> -->

			<Inspector />
			<VisibilitySelection />

			<Divider type="vertical" spacing="0.25rem" />
			<SearchBox />
			<Divider type="vertical" spacing="0.25rem" />

			<!-- svelte-ignore missing-declaration -->
			<Button
				disabled={app.selected?.id === undefined || app.selected?.type !== 'element'}
				onclick={() => chrome.devtools.inspectedWindow.eval('inspect($n).scrollIntoView()')}
			>
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
					<path
						d="M4.5 4a.5.5 0 0 0-.5.5v7c0 .28.22.5.5.5h7a.5.5 0 0 0.5-.5v-7a.5.5 0 0 0-.5-.5h-7zM2 4.5A2.5 2.5 0 0 1 4.5 2h7A2.5 2.5 0 0 1 14 4.5v7a2.5 2.5 0 0 1-2.5 2.5h-7A2.5 2.5 0 0 1 2 11.5v-7M.5 7.5a.5.5 0 0 0 0 1H2v-1H.5zM14 7.5h1.5a.5.5 0 0 1 0 1H14v-1zM8 0c.28 0 .5.22.5.5V2h-1V.5c0-.28.22-.5.5-.5zM8.5 14v1.5a.5.5 0 0 1-1 0V14h1z"
					/>
				</svg>
			</Button>
		</Toolbar>

		<ul bind:this={container} on:mousemove|self={reset} onmouseleave={reset}>
			{#each app.root as node (node.id)}
				<Node {node} />
			{/each}
		</ul>

		<Breadcrumbs />
	</main>

	<!-- component details -->
	<Resizable axis="x">
		{@const events = app.selected?.detail.listeners?.map((l) => {
			const suffix = l.modifiers?.length ? `|${l.modifiers.join('|')}` : '';
			const value = { __is: 'function', source: l.handler };
			return { key: l.event + suffix, value };
		})}

		{#if app.selected?.type === 'component'}
			<h2>Props</h2>
			<PropertyList entries={app.selected.detail.attributes} />

			<Divider type="horizontal" />

			<h2>Events</h2>
			<PropertyList entries={events} />

			<Divider type="horizontal" />

			<h2>State</h2>
			<PropertyList entries={app.selected.detail.ctx} />
		{:else if app.selected?.type === 'block' || app.selected?.type === 'iteration'}
			<h2>State</h2>
			<PropertyList entries={app.selected.detail.ctx} />
		{:else if app.selected?.type === 'element'}
			<h2>Attributes</h2>
			<PropertyList entries={app.selected.detail.attributes} />

			<Divider type="horizontal" />

			<h2>Events</h2>
			<PropertyList entries={events} />
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
