<script lang="ts">
	import Indexer from '$lib/components/Indexer.svelte';
	import ElementAttributes from './ElementAttributes.svelte';
	import Ellipsis from './Ellipsis.svelte';

	import type { ComponentProps } from 'svelte';

	interface Props {
		tagName: string;
		empty: boolean;
		expanded: boolean;
		attributes: ComponentProps<ElementAttributes>['attributes'];
		listeners: ComponentProps<ElementAttributes>['listeners'];
	}

	let { tagName, empty, expanded = $bindable(), attributes, listeners }: Props = $props();

	const memory: Record<string, string> = {};
	const cached = $derived(
		attributes.map((o) => {
			const value = stringify(o.value);
			const flash = memory[o.key] !== value;
			memory[o.key] = value;

			return { ...o, value, flash };
		}),
	);

	function stringify(value: any): string {
		switch (typeof value) {
			case 'string':
				return `"${value}"`;
			case 'undefined':
				return 'undefined';
			case 'number':
				return value != value ? 'NaN' : value.toString();
			case 'object':
				if (value == null) return 'null';
				if (Array.isArray(value)) return `[${value.map(stringify).join(', ')}]`;
				if (value.__is === 'function') return value.name + '()';
				if (value.__is === 'symbol') return value.name;
				return `{${Object.entries(value)
					.map(([key, value]) => `${key}: ${stringify(value)}`)
					.join(', ')}}`;

			case 'bigint':
				return value.toString() + 'n';
			case 'boolean':
				return value.toString();
			default:
				return '';
		}
	}
</script>

{#if empty}
	<div>
		<span>&lt;</span>
		<span class="tag-name">
			<Indexer text={tagName} />
		</span>
		<ElementAttributes attributes={cached} {listeners} />
		<span>&nbsp;/&gt;</span>
	</div>
{:else}
	<div role="group" class:expanded class="expandable" ondblclick={() => (expanded = !expanded)}>
		<span>&lt;</span>
		<span class="tag-name">
			<Indexer text={tagName} />
		</span>
		<ElementAttributes attributes={cached} {listeners} />
		<span>&gt;</span>
		{#if !expanded}
			<Ellipsis onclick={() => (expanded = true)} />

			<span>&lt;/</span>
			<span class="tag-name">
				<Indexer text={tagName} />
			</span>
			<span>&gt;</span>
		{/if}
	</div>
	{#if expanded}
		<slot />
		<div>
			<span>&lt;/</span>
			<span class="tag-name">
				<Indexer text={tagName} />
			</span>
			<span>&gt;</span>
		</div>
	{/if}
{/if}

<style>
	.tag-name {
		color: rgb(0, 116, 232);
	}

	:global(.dark) .tag-name {
		color: rgb(117, 191, 255);
	}
</style>
