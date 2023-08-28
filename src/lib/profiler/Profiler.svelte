<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import Button from '$lib/components/Button.svelte';
	import Panel from '$lib/panel/Panel.svelte';
	import Toolbar from '$lib/toolbar/Toolbar.svelte';
	import ProfileButton from '$lib/toolbar/ProfileButton.svelte';
	import Frame from './Frame.svelte';

	import { profileFrame } from '$lib/store.js';

	let selected: null | ComponentProps<Frame>['children'][0] = null;
	let top: null | number = null;

	function round(n: number) {
		return Math.round(n * 100) / 100;
	}

	$: children = top ? [top] : $profileFrame.children || [];
	$: duration = children.reduce((acc, o) => acc + o.duration, 0);
</script>

<Toolbar>
	{#if top}
		<Button on:click={() => (top = null)}>
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
				<path d="M12.7,1.4 11.3,0l-8,8 8,8 1.4,-1.4L6,8Z" />
			</svg>
		</Button>
	{:else}
		<ProfileButton />
	{/if}
	<Button
		on:click={() => {
			$profileFrame = {};
			top = null;
			selected = null;
		}}
	>
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
			<path
				d="m2.7,14.2 c 0,1 0.8,1.8 1.8,1.8h7c1,0 1.8,-0.8
        1.8,-1.8V3.6H2.7ZM14.2,0.9H11L10.2,0H5.8L4.9,0.9H1.8V2.7h12.5z"
			/>
		</svg>
	</Button>
</Toolbar>
<div class="frame">
	{#if children.length}
		<Frame
			{children}
			{duration}
			on:click={({ detail }) => {
				if (selected === detail) top = detail;
				else selected = detail;
			}}
		/>
	{:else}
		<p>Nothing to display. Perform an action or refresh the page.</p>
	{/if}
</div>
{#if selected}
	<Panel grow="up">
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
	</Panel>
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
	}

	.panel div {
		width: calc(100% / 3);
		display: flex;
		gap: 0.417rem /* 5px */;
		margin: 0.417rem /* 5px */ 0;
	}

	.panel span:first-child {
		font-weight: 500;
	}
</style>
