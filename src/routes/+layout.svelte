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

	import { hovered, root, selected, visibility } from '$lib/store';
	import { background } from '$lib/runtime';
	import Divider from '$lib/components/Divider.svelte';

	const nodes = new Map();

	function insertNode(node: any, target: any, anchorId: number) {
		node.parent = target;

		const index = anchorId ? target.children.findIndex((o: any) => o.id == anchorId) : -1;

		if (index !== -1) {
			target.children.splice(index, 0, node);
		} else {
			target.children.push(node);
		}

		target.invalidate();
	}

	function resolveEventBubble(node: any) {
		if (!node.detail || !node.detail.listeners) return;

		for (const listener of node.detail.listeners) {
			if (!listener.handler.includes('bubble($$self, event)')) continue;

			listener.handler = () => {
				let target = node;
				while ((target = target.parent)) if (target.type == 'component') break;

				const listeners = target.detail.listeners;
				if (!listeners) return null;

				const parentListener = listeners.find((o: any) => o.event == listener.event);
				if (!parentListener) return null;

				const handler = parentListener.handler;
				if (!handler) return null;

				return '// From parent\n' + (typeof handler == 'function' ? handler() : handler);
			};
		}
	}

	background.onMessage.addListener(({ type, node, target, anchor }) => {
		console.log({ type, node, target, anchor });
		switch (type) {
			case 'ext/clear': {
				selected.set(undefined);
				hovered.set(undefined);
				root.set([]);
				break;
			}

			case 'courier/node:add': {
				node.children = [];
				node.expanded = false;
				node.invalidate = () => {};
				resolveEventBubble(node);

				const targetNode = nodes.get(target);
				nodes.set(node.id, node);

				if (targetNode) {
					insertNode(node, targetNode, anchor);
					return;
				}

				if (node._timeout) return;

				node._timeout = setTimeout(() => {
					delete node._timeout;
					const targetNode = nodes.get(target);
					if (targetNode) insertNode(node, targetNode, anchor);
					else root.update((o) => [...o, node]);
				}, 100);

				break;
			}

			case 'courier/node:remove': {
				const current = nodes.get(node.id);
				nodes.delete(current.id);
				if (!current.parent) break;

				const index = current.parent.children.findIndex((o: any) => o.id == current.id);
				current.parent.children.splice(index, 1);
				current.parent.invalidate();
				break;
			}

			case 'courier/node:update': {
				const current = nodes.get(node.id);
				Object.assign(current, node);
				resolveEventBubble(current);

				if ($selected?.id == node.id) selected.update((o) => o);

				return current.invalidate();
			}

			case 'inspect': {
				const current = nodes.get(node.id);
				return selected.set(current);
			}

			// case 'courier:profile.update': {
			// 	resolveFrame(frame);
			// 	profileFrame.set(frame);
			// 	break;

			// 	function resolveFrame(frame) {
			// 		frame.children.forEach(resolveFrame);

			// 		if (!frame.node) return;

			// 		frame.node = nodes.get(frame.node) || {
			// 			type: 'Unknown',
			// 			tagName: 'Unknown',
			// 		};
			// 	}
			// }
		}
	});
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
			return index > 0 ? siblings[index - 1] : $selected.parent ?? $selected;
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
			<PickerButton />
			<VisibilitySelection />

			<Divider type="vertical" margin="0.25rem" />
			<SearchBox />
			<Divider type="vertical" margin="0.25rem" />

			<Button
				disabled={$selected?.id === undefined}
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
