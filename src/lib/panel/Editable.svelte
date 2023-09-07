<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let type: 'string' | 'number' | 'null';
	export let value: any;
	export let readonly: boolean;

	const dispatch = createEventDispatcher();

	let editing = false;
</script>

{#if editing}
	<input
		value={JSON.stringify(value)}
		on:blur={({ target }) => {
			editing = false;
			// @ts-expect-error - target and value exists
			dispatch('change', target.value);
		}}
		on:keydown={({ key, target }) => {
			if (key !== 'Enter') return;
			editing = false;
			// @ts-expect-error - target and value exists
			dispatch('change', target.value);
		}}
	/>
{:else}
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<span class:readonly class={type} on:click={() => (editing = !readonly)}>
		{JSON.stringify(value)}
	</span>
{/if}

<style>
	span,
	input {
		flex-grow: 1;
	}

	input {
		padding: 0.15rem 0.375rem;
		border: none;
		border-radius: inherit;
		font-size: inherit;
	}

	span:not(.readonly) {
		cursor: pointer;
	}
	span.string {
		color: rgb(221, 0, 169);
	}
	span.number {
		color: rgb(5, 139, 0);
	}
	span.null {
		color: rgb(115, 115, 115);
	}

	:global(.dark) span.string {
		color: rgb(255, 125, 233);
	}
</style>
