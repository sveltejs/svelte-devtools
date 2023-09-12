<script>
	export let selected = false;
	export let collapsed;
	let className;
	export { className as class };
</script>

<span class={className} class:selected class:collapsed on:click={(e) => (collapsed = !collapsed)} />

<style>
	span {
		position: relative;
		display: inline-block;
		align-self: stretch;
		width: 1.25rem /* 15px */;
		vertical-align: bottom;
		cursor: pointer;
	}

	span::after {
		position: absolute;
		bottom: 0.333rem /* 4px */;
		left: 0.333rem /* 4px */;
		width: 0;
		height: 0;
		border-top: 0.417rem /* 5px */ solid rgba(135, 135, 137, 0.9);
		border-right: 0.333rem /* 4px */ solid transparent;
		border-left: 0.333rem /* 4px */ solid transparent;
		content: '';
		transition: transform 0.3s;
		transform: rotate(0deg);
	}

	:global(.node-tree) span::after {
		bottom: 0.5rem;
	}

	span.selected::after {
		border-top-color: #ffffff;
	}

	span.collapsed::after {
		transform: rotate(-90deg);
	}
</style>
