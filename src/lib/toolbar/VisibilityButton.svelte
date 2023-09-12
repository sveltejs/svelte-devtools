<script>
	import { visibility } from '../store.js';
	import Button from './Button.svelte';

	let isOpen = false;
</script>

<Button on:click={(e) => (isOpen = true)}>
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
		<path
			d="M8 2C4.36364 2 1.25818 4.28067 0 7.5 1.25818 10.71933 4.36364 13 8
      13s6.74182-2.28067 8-5.5C14.74182 4.28067 11.63636 2 8 2zm0
      9.16667c-2.00727 0-3.63636-1.64267-3.63636-3.66667S5.99273 3.83333 8
      3.83333 11.63636 5.476 11.63636 7.5 10.00727 11.16667 8 11.16667zM8
      5.3c-1.20727 0-2.18182.98267-2.18182 2.2S6.79273 9.7 8 9.7s2.18182-.98267
      2.18182-2.2S9.20727 5.3 8 5.3z"
		/>
	</svg>
	{#if isOpen}
		<div on:click|stopPropagation={(e) => (isOpen = false)} />
		<ul>
			<span />
			<li
				class:checked={$visibility.component}
				on:click={(e) => ($visibility.component = !$visibility.component)}
			>
				Components
			</li>
			<li
				class:checked={$visibility.element}
				on:click={(e) => ($visibility.element = !$visibility.element)}
			>
				Elements
			</li>
			<li
				class:checked={$visibility.block}
				on:click={(e) => ($visibility.block = !$visibility.block)}
			>
				Blocks
			</li>
			<li class:checked={$visibility.slot} on:click={(e) => ($visibility.slot = !$visibility.slot)}>
				Slots
			</li>
			<li
				class:checked={$visibility.anchor}
				on:click={(e) => ($visibility.anchor = !$visibility.anchor)}
			>
				Anchors
			</li>
			<li class:checked={$visibility.text} on:click={(e) => ($visibility.text = !$visibility.text)}>
				Text
			</li>
		</ul>
	{/if}
</Button>

<style>
	div {
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		cursor: default;
	}

	ul {
		position: absolute;
		top: 2.667rem /* 32px */;
		left: -1.667rem /* -20px */;
		padding: 0.5rem /* 6px */ 0;
		border: 0.083rem /* 1px */ solid rgb(224, 224, 226);
		border-radius: 0.167rem /* 2px */;
		background-color: #ffffff;
		box-shadow: 0 0.083rem 0.25rem rgba(0, 0, 0, 0.075) !important;
		text-align: left;
		line-height: 1;
	}

	span {
		position: absolute;
		top: -0.833rem /* -10px */;
		left: 1.667rem /* 20px */;
		display: block;
		overflow: hidden;
		width: 1.917rem /* 23px */;
		height: 1rem /* 12px */;
	}

	span::before {
		position: absolute;
		top: 0.25rem /* 3px */;
		left: 0.167rem /* 2px */;
		display: block;
		width: 1.333rem /* 16px */;
		height: 1.333rem /* 16px */;
		border: 0.083rem /* 1px */ solid rgb(224, 224, 226);
		background-color: #ffffff;
		box-shadow: 0 0.083rem 0.25rem rgba(0, 0, 0, 0.075) !important;
		content: '';
		transform: rotate(45deg);
	}

	li {
		position: relative;
		padding: 0.333rem /* 4px */ 0.833rem /* 10px */ 0.333rem /* 4px */ 2.333rem /* 28px */;
	}

	li:hover {
		background-color: rgb(239, 239, 242);
	}

	li.checked::before {
		position: absolute;
		top: 0;
		left: 0.833rem /* 10px */;
		display: block;
		width: 0.917rem /* 11px */;
		height: 100%;
		background: center / contain no-repeat
			url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='rgb(12, 12, 13)'%3E%3Cpath stroke-width='0.5' d='M6 14a1 1 0 0 1-.707-.293l-3-3a1 1 0 0 1 1.414-1.414l2.157 2.157 6.316-9.023a1 1 0 0 1 1.639 1.146l-7 10a1 1 0 0 1-.732.427A.863.863 0 0 1 6 14z'/%3E%3C/svg%3E%0A");
		content: '';
	}

	:global(.dark) li.checked::before {
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='rgba(249, 249, 250, 0.7)'%3E%3Cpath stroke-width='0.5' d='M6 14a1 1 0 0 1-.707-.293l-3-3a1 1 0 0 1 1.414-1.414l2.157 2.157 6.316-9.023a1 1 0 0 1 1.639 1.146l-7 10a1 1 0 0 1-.732.427A.863.863 0 0 1 6 14z'/%3E%3C/svg%3E%0A");
	}

	:global(.dark) span:before,
	:global(.dark) ul {
		border: none;
		background-color: #4a4a4f;
		color: #f9f9fa;
	}

	:global(.dark) li:hover {
		background-color: #5c5c61;
	}
</style>
