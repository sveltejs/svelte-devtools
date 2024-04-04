<script lang="ts">
	interface Props {
		type: 'string' | 'number' | 'null';
		value: any;
		readonly: boolean;
		onchange(updated: unknown): void;
	}

	let { type, value, readonly, onchange }: Props = $props();

	let editing = $state(false);
</script>

{#if editing}
	<input
		value={JSON.stringify(value)}
		onblur={({ target }) => {
			editing = false;
			// @ts-expect-error - target and value exists
			const updated = target.value;
			onchange((value = JSON.parse(updated)));
		}}
		onkeydown={({ key, target }) => {
			if (key !== 'Enter') return;
			editing = false;
			// @ts-expect-error - target and value exists
			const updated = target.value;
			onchange((value = JSON.parse(updated)));
		}}
	/>
{:else}
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<span class:readonly class={type} onclick={() => (editing = !readonly)}>
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
