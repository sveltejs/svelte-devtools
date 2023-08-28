<script>
	import { profileFrame } from '../store.js';
	import Frame from './Frame.svelte';
	import Panel from '../panel/Panel.svelte';
	import Toolbar from '../toolbar/Toolbar.svelte';
	import Button from '../toolbar/Button.svelte';
	import ProfileButton from '../toolbar/ProfileButton.svelte';

	let selected;
	let top;

	function handleClick(e) {
		if (selected == e.detail) top = e.detail;
		else selected = e.detail;
	}

	function round(n) {
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
		<Frame {children} {duration} on:click={handleClick} />
	{:else}
		<p>Nothing to display. Perform an action or refresh the page.</p>
	{/if}
</div>
{#if selected}
	<Panel grow="up">
		<div class="panel">
			<div>
				<span>Tag name</span>
				{selected.node.tagName}&nbsp;(#{selected.node.id})
			</div>
			<div><span>Start</span> {round(selected.start)}ms</div>
			<div><span>Operation</span> {selected.type}</div>
			<div><span>Block type</span> {selected.node.type}</div>
			<div><span>End</span> {round(selected.end)}ms</div>
			<div>
				<span>Duration</span>
				{round(selected.children.reduce((acc, o) => acc - o.duration, selected.duration))}ms
				of&nbsp;{round(selected.duration)}ms
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
		margin: 0.417rem /* 5px */ 0;
		width: calc(100% / 3);
	}

	.panel span {
		margin-right: 0.417rem /* 5px */;
		font-weight: bold;
	}
</style>
