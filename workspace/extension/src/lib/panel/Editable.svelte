<script lang="ts">
	interface Props {
		type: 'string' | 'number' | 'null';
		value: string;
		readonly: boolean;
		onchange(updated: string): void;
	}

	let { type, value, readonly, onchange }: Props = $props();

	let editing = $state(false);

	function update(v: string) {
		editing = false;
		switch (true) {
			case v === '':
			case v === 'undefined': {
				type = 'null';
				v = 'undefined';
				break;
			}
			case v === 'null': {
				type = v = 'null';
				break;
			}
			case v === 'true' || v === 'false': {
				type = 'number';
				v = `${v === 'true'}`;
				break;
			}
			case !Number.isNaN(Number(v)): {
				type = 'number';
				v = `${Number(v)}`;
				break;
			}
			default: {
				type = 'string';
				break;
			}
		}
		value = v;
		onchange(type === 'string' ? `"${v.replace(/"/g, '\\"')}"` : v);
	}
</script>

{#if editing}
	<input
		value={value === null ? 'null' : value === undefined ? 'undefined' : value}
		onblur={({ target }) => {
			// @ts-expect-error - target and value exists
			update(target.value);
		}}
		onkeydown={({ key, target }) => {
			if (key !== 'Enter') return;
			// @ts-expect-error - target and value exists
			update(target.value);
		}}
	/>
{:else}
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<span class:readonly class={type} onclick={() => (editing = !readonly)}>
		{type === 'string' ? `"${value}"` : `${value}`}
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
