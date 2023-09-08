<script lang="ts">
	import Indexer from '../components/Indexer.svelte';
	import ElementAttributes from './ElementAttributes.svelte';

	import type { ComponentProps } from 'svelte';

	export let expanded: boolean;
	export let hasChildren: boolean;
	export let hover: boolean;
	export let selected: boolean;
	export let style: string;
	export let tagName: string;

	export let attributes: ComponentProps<ElementAttributes>['attributes'];
	export let listeners: ComponentProps<ElementAttributes>['listeners'];

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

	const memory: Record<string, string> = {};
	$: cached = attributes.map((o) => {
		const value = stringify(o.value);
		const flash = memory[o.key] !== value;
		memory[o.key] = value;

		return { ...o, value, flash };
	});
</script>

{#if hasChildren}
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div
		{style}
		class:expanded
		class:hover
		class:selected
		class="expandable"
		on:dblclick={() => (expanded = !expanded)}
	>
		<span>&lt;</span>
		<span class="tag-name">
			<Indexer text={tagName} />
		</span>
		<ElementAttributes attributes={cached} {listeners} />
		&gt;
		{#if !expanded}
			&hellip;&lt;/
			<span class="tag-name">
				<Indexer text={tagName} />
			</span>
			&gt;
		{/if}
	</div>
	{#if expanded}
		<slot />
		<div class:hover {style}>
			&lt;/
			<span class="tag-name">
				<Indexer text={tagName} />
			</span>
			&gt;
		</div>
	{/if}
{:else}
	<div class:hover class:selected {style}>
		<span>&lt;</span>
		<span class="tag-name">
			<Indexer text={tagName} />
		</span>
		<ElementAttributes attributes={cached} {listeners} />
		<span>&nbsp;/&gt;</span>
	</div>
{/if}

<style>
	div {
		display: flex;
		flex-wrap: wrap;
		line-height: 1.5;
	}

	.tag-name {
		color: rgb(0, 116, 232);
	}

	:global(.dark) .tag-name {
		color: rgb(117, 191, 255);
	}
</style>
