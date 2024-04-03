<script lang="ts">
	import Editable from './Editable.svelte';
	import Expandable from './Expandable.svelte';

	interface Props {
		key: string | number;
		value: any;
		readonly: boolean;
		error?: string;
		onchange(updated: unknown): void;
	}

	const { key, value, readonly, error, onchange }: Props = $props();

	function stringify(value: unknown, k?: any, v?: any): string {
		if (Array.isArray(value))
			return `[${value.map((value, i) => (i == k ? v : stringify(value))).join(',')}]`;
		if (value === null) return 'null';
		if (value === undefined) return 'undefined';

		switch (typeof value) {
			case 'string':
				return `"${value}"`;
			case 'number':
				return value.toString();
			case 'object':
				return `{${Object.entries(value)
					.map(([key, value]) => `"${key}":${key == k ? v : stringify(value)}`)
					.join(',')}}`;

			default: // when is this ever the case?
				return value?.toString() ?? 'undefined';
		}
	}

	let expanded = $state(false);

	const type = $derived(typeof value);
	const expandable = $derived.by(() => {
		return (
			value != null &&
			value === value &&
			type === 'object' &&
			((Array.isArray(value) && value.length) ||
				value.__is === 'function' ||
				value.__is === 'symbol' ||
				Object.keys(value).length)
		);
	});
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<li
	data-tooltip={error || null}
	style:--indent="-3px"
	style:--y-pad="0.125rem"
	class:expanded
	class:expandable
	onclick={(event) => {
		event.stopPropagation();
		expanded = !expanded;
	}}
>
	<span>{key}:</span>
	<span>&nbsp;</span>

	{#if type === 'string'}
		<Editable type="string" {value} {readonly} {onchange} />
	{:else if value == null || value !== value}
		<Editable type="null" {value} {readonly} {onchange} />
	{:else if type === 'number' || type === 'boolean'}
		<Editable type="number" {value} {readonly} {onchange} />
	{:else if Array.isArray(value)}
		<span class="object">Array [{value.length || ''}]</span>

		{#if value.length && expanded}
			<ul>
				{#each value as v, key}
					<Expandable
						{key}
						value={v}
						{readonly}
						onchange={(updated) => onchange(stringify(value, key, updated))}
					/>
				{/each}
			</ul>
		{/if}
	{:else if type === 'object'}
		{#if value.__is === 'function'}
			<span class="function">function {value.name || ''}()</span>
			{#if expanded}<pre style:width="100%">{value.source}</pre>{/if}
		{:else if value.__is === 'symbol'}
			<span class="symbol">{value.name || 'Symbol()'}</span>
		{:else if Object.keys(value).length}
			<span class="object">Object &lbrace;&hellip;&rbrace;</span>
			{#if expanded}
				<ul>
					{#each Object.entries(value) as [key, v] (key)}
						<Expandable
							{key}
							value={v}
							{readonly}
							onchange={(updated) => onchange(stringify(value, key, updated))}
						/>
					{/each}
				</ul>
			{/if}
		{:else}
			<span class="object">Object &lbrace; &rbrace;</span>
		{/if}
	{/if}
</li>

<style>
	ul {
		width: 100%;
		display: grid;
		gap: 0.25rem;
		padding-left: 1rem;
		margin-top: 0.25rem;
	}
	li {
		position: relative;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		padding: 0.25rem;
		border-radius: 0.25rem;
	}
	li[data-tooltip] {
		background: rgba(179, 0, 0, 0.8);
	}
	li:hover {
		background: rgba(135, 135, 137, 0.075);
	}

	.function,
	.symbol,
	.object {
		color: rgb(0, 116, 232);
	}

	:global(.dark) .function,
	:global(.dark) .symbol,
	:global(.dark) .object {
		color: rgb(117, 191, 255);
	}
</style>
