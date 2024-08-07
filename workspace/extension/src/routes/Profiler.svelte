<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import Button from '$lib/components/Button.svelte';
	import Resizable from '$lib/components/Resizable.svelte';
	import Toolbar from '$lib/components/Toolbar.svelte';
	import ProfileButton from './ProfileButton.svelte';
	import ProfilerFrame from './ProfilerFrame.svelte';

	interface Profiler {
		type: 'mount' | 'patch' | 'detach';
		node: import('$lib/state.svelte').DebugNode;
		duration: number;
		start: number;
		end: number;
		children: Profiler[];
	}

	let profileFrame: undefined | Profiler = $state();

	let selected: null | ComponentProps<ProfilerFrame>['children'][0] = $state(null);
	let top: null | ComponentProps<ProfilerFrame>['children'][0] = $state(null);

	function round(n: number) {
		return Math.round(n * 100) / 100;
	}

	const children = $derived(top ? [top] : profileFrame?.children || []);
	const duration = $derived(children.reduce((acc, o) => acc + o.duration, 0));
</script>

<Toolbar>
	{#if top}
		<Button onclick={() => (top = null)}>
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
				<path d="M12.7,1.4 11.3,0l-8,8 8,8 1.4,-1.4L6,8Z" />
			</svg>
		</Button>
	{:else}
		<ProfileButton />
	{/if}
	<Button
		onclick={() => {
			profileFrame = undefined;
			top = null;
			selected = null;
		}}
	>
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
			<path
				d="m2.7,14.2 c 0,1 0.8,1.8 1.8,1.8h7c1,0 1.8,-0.8 1.8,-1.8V3.6H2.7ZM14.2,0.9H11L10.2,0H5.8L4.9,0.9H1.8V2.7h12.5z"
			/>
		</svg>
	</Button>
</Toolbar>
<div class="frame">
	{#if children.length}
		<ProfilerFrame
			{children}
			{duration}
			onclick={(frame) => {
				if (selected === frame) top = frame;
				else selected = frame;
			}}
		/>
	{:else}
		<p>Nothing to display. Perform an action or refresh the page.</p>
	{/if}
</div>
{#if selected}
	<Resizable axis="y">
		<div class="panel">
			<div>
				<span>Tag name</span>
				<span>{selected.node.tagName}</span>
				<span>(#{selected.node.id})</span>
			</div>
			<div>
				<span>Start</span>
				<span>{round(selected.start)}ms</span>
			</div>
			<div>
				<span>Operation</span>
				<span>{selected.type}</span>
			</div>
			<div>
				<span>Block type</span>
				<span>{selected.node.type}</span>
			</div>
			<div>
				<span>End</span>
				<span>{round(selected.end)}ms</span>
			</div>
			<div>
				<span>Duration</span>
				<span>
					{round(selected.children.reduce((acc, o) => acc - o.duration, selected.duration))}ms
				</span>
				<span>of</span>
				<span>{round(selected.duration)}ms</span>
			</div>
		</div>
	</Resizable>
{/if}

<style>
	.frame {
		flex-grow: 1;
	}

	p {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
	}

	.panel {
		display: flex;
		flex-wrap: wrap;
		padding: 1rem;

		div {
			width: calc(100% / 3);
			display: flex;
			gap: 0.417rem /* 5px */;
			margin: 0.417rem /* 5px */ 0;
		}

		span:first-child {
			font-weight: 500;
		}
	}
</style>
