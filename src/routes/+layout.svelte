<script lang="ts">
	import '../app.css';

	// import Profiler from '$lib/profiler/Profiler.svelte';
	import ReloadExtension from './ReloadExtension.svelte';

	import { onMount } from 'svelte';
	import { hoveredNodeId, rootNodes, selectedNode, port } from '$lib/store';
	import ConnectMessage from './ConnectMessage.svelte';

	let profiling = false;

	// const nodes = new Map();

	// function resolveEventBubble(node) {
	// 	if (!node.detail || !node.detail.listeners) return;

	// 	for (const listener of node.detail.listeners) {
	// 		if (!listener.handler.includes('bubble($$self, event)')) continue;

	// 		listener.handler = () => {
	// 			let target = node;
	// 			while ((target = target.parent)) if (target.type == 'component') break;

	// 			const listeners = target.detail.listeners;
	// 			if (!listeners) return null;

	// 			const parentListener = listeners.find((o) => o.event == listener.event);
	// 			if (!parentListener) return null;

	// 			const handler = parentListener.handler;
	// 			if (!handler) return null;

	// 			return '// From parent\n' + (typeof handler == 'function' ? handler() : handler);
	// 		};
	// 	}
	// }

	onMount(() => {
		$port = chrome.runtime.connect();

		// TODO: reenable profiler
		// port.postMessage({
		// 	type: 'init',
		// 	profilerEnabled: get(profilerEnabled),
		// 	tabId: chrome.devtools.inspectedWindow.tabId,
		// });

		selectedNode.subscribe((node) => {
			$port.postMessage({
				type: 'setSelected',
				tabId: chrome.devtools.inspectedWindow.tabId,
				nodeId: node.id,
			});

			let invalid = null;
			while (node.parent) {
				node = node.parent;
				if (node.collapsed) {
					invalid = node;
					node.collapsed = false;
				}
			}

			if (invalid) invalid.invalidate();
		});

		$port.onMessage.addListener((msg) => {
			switch (msg.type) {
				case 'clear': {
					selectedNode.set({});
					hoveredNodeId.set(-1);
					rootNodes.set([]);

					break;
				}

				// case 'addNode': {
				// 	const node = msg.node;
				// 	node.children = [];
				// 	node.collapsed = true;
				// 	node.invalidate = () => {};
				// 	resolveEventBubble(node);

				// 	const targetNode = nodes.get(msg.target);
				// 	nodes.set(node.id, node);

				// 	if (targetNode) {
				// 		insertNode(node, targetNode, msg.anchor);
				// 		return;
				// 	}

				// 	if (node._timeout) return;

				// 	node._timeout = setTimeout(() => {
				// 		delete node._timeout;
				// 		const targetNode = nodes.get(msg.target);
				// 		if (targetNode) insertNode(node, targetNode, msg.anchor);
				// 		else rootNodes.update((o) => (o.push(node), o));
				// 	}, 100);

				// 	break;
				// }

				// case 'removeNode': {
				// 	const node = nodes.get(msg.node.id);
				// 	nodes.delete(node.id);

				// 	if (!node.parent) break;

				// 	const index = node.parent.children.findIndex((o) => o.id == node.id);
				// 	node.parent.children.splice(index, 1);

				// 	node.parent.invalidate();

				// 	break;
				// }

				// case 'updateNode': {
				// 	const node = nodes.get(msg.node.id);
				// 	Object.assign(node, msg.node);
				// 	resolveEventBubble(node);

				// 	const selected = get(selectedNode);
				// 	if (selected && selected.id == msg.node.id) selectedNode.update((o) => o);

				// 	node.invalidate();

				// 	break;
				// }

				// case 'inspect': {
				// 	let node = nodes.get(msg.node.id);
				// 	selectedNode.set(node);

				// 	break;
				// }

				// case 'updateProfile': {
				// 	resolveFrame(msg.frame);
				// 	profileFrame.set(msg.frame);
				// 	break;

				// 	function resolveFrame(frame) {
				// 		frame.children.forEach(resolveFrame);

				// 		if (!frame.node) return;

				// 		frame.node = nodeMap.get(frame.node) || {
				// 			tagName: 'Unknown',
				// 			type: 'Unknown',
				// 		};
				// 	}
				// }
			}
		});
	});

	$: if ($hoveredNodeId !== -1) {
		$port.postMessage({
			type: 'setHover',
			tabId: chrome.devtools.inspectedWindow.tabId,
			nodeId: $hoveredNodeId,
		});
	}
</script>

<svelte:window
	on:keydown={({ target }) => {
		if (target !== document.body) return;

		// selectedNode.update((node) => {
		// 	if (node.invalidate === undefined) return node;
		// 	switch (key) {
		// 		case 'Enter':
		// 			node.collapsed = !node.collapsed;
		// 			node.invalidate();
		// 			return node;

		// 		case 'ArrowRight':
		// 			node.collapsed = false;
		// 			node.invalidate();
		// 			return node;

		// 		case 'ArrowDown': {
		// 			const children = interactableNodes(node.children);

		// 			if (node.collapsed || children.length === 0) {
		// 				var next = node;
		// 				var current = node;
		// 				do {
		// 					const siblings = interactableNodes(
		// 						current.parent === undefined ? get(rootNodes) : current.parent.children,
		// 					);
		// 					const index = siblings.findIndex((o) => o.id === current.id);
		// 					next = siblings[index + 1];

		// 					current = current.parent;
		// 				} while (next === undefined && current !== undefined);

		// 				return next ?? node;
		// 			} else {
		// 				return children[0];
		// 			}
		// 		}

		// 		case 'ArrowLeft':
		// 			node.collapsed = true;
		// 			node.invalidate();
		// 			return node;

		// 		case 'ArrowUp': {
		// 			const siblings = interactableNodes(
		// 				node.parent === undefined ? get(rootNodes) : node.parent.children,
		// 			);
		// 			const index = siblings.findIndex((o) => o.id === node.id);
		// 			return index > 0 ? siblings[index - 1] : node.parent ?? node;
		// 		}

		// 		default:
		// 			return node;
		// 	}
		// });

		// function interactableNodes(list) {
		// 	const _visibility = get(visibility);
		// 	return list.filter((o) => _visibility[o.type] && o.type !== 'text' && o.type !== 'anchor');
		// }
	}}
/>

{#if $rootNodes.length}
	<!-- <Profiler /> -->

	<slot />
{:else}
	<ConnectMessage />
{/if}

<ReloadExtension />
