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
		children: import('svelte').Snippet;
	}

	let { tagName, empty, expanded = $bindable(), attributes, listeners, children }: Props = $props();

	const cached = $derived(attributes.map((o) => ({ ...o, value: stringify(o.value) })));

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

{#snippet close()}
	<span>&lt;/</span>
	<span class="tag">
		<Indexer text={tagName} />
	</span>
	<span>&gt;</span>
{/snippet}

<div
	role="group"
	class:expandable={!empty}
	class:expanded
	ondblclick={() => (expanded = !empty && !expanded)}
>
	<span>&lt;</span>
	<span class="tag">
		<Indexer text={tagName} />
	</span>
	<ElementAttributes attributes={cached} {listeners} />

	{#if empty}
		<span>&nbsp;/&gt;</span>
	{:else}
		<span>&gt;</span>
		{#if !expanded}
			<Ellipsis onclick={() => (expanded = true)} />

			{@render close()}
		{/if}
	{/if}
</div>

{#if expanded}
	{@render children()}

	<div>
		{@render close()}
	</div>
{/if}

<style>
	.tag {
		color: rgb(142, 0, 75);
	}

	:global(.dark) .tag {
		color: rgb(117, 191, 255);
	}
</style>
