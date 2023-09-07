<script lang="ts">
	import Editable from './Editable.svelte';

	import { scope } from 'mauss';
	import { createEventDispatcher } from 'svelte';

	export let key: string;
	export let value: any;
	export let error: string | undefined;
	export let readonly: boolean;

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

	const dispatch = createEventDispatcher();

	let expanded = false;

	$: type = typeof value;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<li
	data-tooltip={error || null}
	class:expanded
	class:collapsible={scope(() => {
		if (value == null || value !== value) return false;
		if (Array.isArray(value)) return value.length;
		if (type === 'object') {
			return value.__isFunction || value.__isSymbol || Object.keys(value).length;
		}
	})}
	on:click|stopPropagation={() => (expanded = !expanded)}
>
	<span>{key}:</span>
	<span>&nbsp;</span>

	{#if type === 'string'}
		<Editable type="string" {value} {readonly} on:change />
	{:else if value == null || value !== value}
		<Editable type="null" {value} {readonly} on:change />
	{:else if type === 'number' || type === 'boolean'}
		<Editable type="number" {value} {readonly} on:change />
	{:else if Array.isArray(value)}
		<span class="object">Array [{value.length || ''}]</span>

		{#if value.length && expanded}
			<ul>
				{#each value as v, key}
					<svelte:self
						{key}
						value={v}
						{readonly}
						on:change={(e) => dispatch('change', stringify(value, key, e.detail))}
					/>
				{/each}
			</ul>
		{/if}
	{:else if type === 'object'}
		{#if value.__isFunction}
			<span class="function">function {value.name || ''}()</span>
			{#if expanded}<pre style:width="100%">{value.source}</pre>{/if}
		{:else if value.__isSymbol}
			<span class="symbol">{value.name || 'Symbol()'}</span>
		{:else if Object.keys(value).length}
			<span class="object">Object &lbrace;&hellip;&rbrace;</span>
			{#if expanded}
				<ul>
					{#each Object.entries(value) as [key, v] (key)}
						<svelte:self
							{key}
							value={v}
							{readonly}
							on:change={(e) => dispatch('change', stringify(value, key, e.detail))}
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
	li.collapsible::before {
		content: '';
		position: absolute;
		top: 0;
		right: 100%;

		border-top: 0.375rem solid rgba(135, 135, 137, 0.9);
		border-right: 0.25rem solid transparent;
		border-left: 0.25rem solid transparent;
		transition-duration: 240ms;
		transform: translate3d(-25%, calc(0.375rem + 50%), 0) rotate(-90deg);
	}
	li.collapsible.expanded::before {
		transform: translate3d(-25%, calc(0.375rem + 50%), 0) rotate(0deg);
	}

	.function,
	.symbol,
	.object {
		color: rgb(0, 116, 232);
	}

	li :global(.collapse) {
		margin-left: -1.25rem;
	}

	:global(.dark) .function,
	:global(.dark) .symbol,
	:global(.dark) .object {
		color: rgb(117, 191, 255);
	}
</style>
