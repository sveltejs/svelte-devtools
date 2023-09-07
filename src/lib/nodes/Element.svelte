<script lang="ts">
	import Collapse from './Collapse.svelte';
	import SearchTerm from './SearchTerm.svelte';
	import ElementAttributes from './ElementAttributes.svelte';

	export let style;
	export let hasChildren;
	export let hover;
	export let selected;
	export let tagName;
	export let attributes = [];
	export let listeners = [];
	export let collapsed;

	function stringify(value) {
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
				if (value.__isFunction) return value.name + '()';
				if (value.__isSymbol) return value.name;
				return `{${Object.entries(value)
					.map(([key, value]) => `${key}: ${stringify(value)}`)
					.join(', ')}}`;
		}
	}

	let _attributes;
	let cache = {};
	$: {
		let localCache = {};
		_attributes = attributes.map((o) => {
			const value = stringify(o.value);
			localCache[o.key] = value;

			return {
				...o,
				value,
				flash: !!_attributes && value != cache[o.key],
			};
		});
		cache = localCache;
	}
</script>

{#if hasChildren}
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div class:hover class:selected {style} on:dblclick={(e) => (collapsed = !collapsed)}>
		<Collapse {selected} bind:collapsed />
		<span>&lt;</span>
		<span class="tag-name">
			<SearchTerm text={tagName} />
		</span>
		<ElementAttributes attributes={_attributes} {listeners} />
		&gt;
		{#if collapsed}
			&hellip;&lt;/
			<span class="tag-name">
				<SearchTerm text={tagName} />
			</span>
			&gt;
		{/if}
	</div>
	{#if !collapsed}
		<slot />
		<div class:hover {style}>
			&lt;/
			<span class="tag-name">
				<SearchTerm text={tagName} />
			</span>
			&gt;
		</div>
	{/if}
{:else}
	<div class:hover class:selected {style}>
		<span>&lt;</span>
		<span class="tag-name">
			<SearchTerm text={tagName} />
		</span>
		<ElementAttributes attributes={_attributes} {listeners} />
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
