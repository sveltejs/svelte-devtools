<script>
	import { createEventDispatcher } from 'svelte';

	export let value;
	export let readOnly;
	let className;
	export { className as class };

	const dispatch = createEventDispatcher();
	function commit(e) {
		isEditing = false;
		dispatch('change', e.target.value);
	}

	let isEditing = false;
	let input;

	$: if (input) input.select();
</script>

{#if isEditing}
	<input
		bind:this={input}
		value={JSON.stringify(value)}
		on:keydown={(e) => e.key == 'Enter' && commit(e)}
		on:blur={commit}
	/>
{:else}
	<span class={className} class:readOnly on:click={() => (isEditing = !readOnly)}>
		{JSON.stringify(value)}
	</span>
{/if}

<style>
	span:not(.readOnly) {
		flex-grow: 1;
		cursor: pointer;
	}

	input {
		flex-grow: 1;
		margin-right: 0.833rem /* 10px */;
		outline: none;
		border: none;
		box-shadow: 0 0 2px 1px rgba(0, 0, 0, 0.1);
		font-size: inherit;
	}
</style>
