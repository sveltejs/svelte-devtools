<script lang="ts">
	import Editable from './Editable.svelte';
	import PropertyList from './PropertyList.svelte';

	import { app } from '$lib/state.svelte';
	import { inject, errors } from './core.svelte';

	interface Props {
		entries?: Array<{
			key: string;
			value: any;
			readonly?: boolean;
		}>;
		keys?: string[];
	}

	const { entries = [], keys: parents = [] }: Props = $props();

	const expanded = $state<{ [k: string]: boolean }>({});
</script>

{#if entries.length}
	<ul>
		{#each entries as { key, value, readonly = false } (key)}
			{@const keys = [...parents, key]}
			{@const type = typeof value}

			<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
			<li
				data-tooltip={errors[`${app.selected?.id}+${keys.join('.')}`] || null}
				style:--indent="-3px"
				style:--y-pad="0.125rem"
				class:expanded={expanded[key]}
				class:expandable={value != null &&
					value === value &&
					type === 'object' &&
					((Array.isArray(value) && value.length) ||
						value.__is === 'function' ||
						value.__is === 'symbol' ||
						Object.keys(value).length)}
				onclick={(event) => {
					event.stopPropagation();
					expanded[key] = !expanded[key];
				}}
			>
				<span>{key}:</span>
				<span>&nbsp;</span>

				{#if type === 'string'}
					<Editable
						{readonly}
						type="string"
						{value}
						onchange={(updated) => inject(keys, updated)}
					/>
				{:else if value == null || value !== value}
					<Editable
						{readonly}
						type="null"
						value={value === null ? 'null' : 'undefined'}
						onchange={(updated) => inject(keys, updated)}
					/>
				{:else if type === 'number' || type === 'boolean'}
					<Editable
						{readonly}
						type="number"
						{value}
						onchange={(updated) => inject(keys, updated)}
					/>
				{:else if Array.isArray(value)}
					<span class="object">Array [{value.length || ''}]</span>

					{#if value.length && expanded[key]}
						{@const entries = value.map((v, i) => ({ key: `${i}`, value: v, readonly }))}

						<PropertyList {entries} {keys} />
					{/if}
				{:else if type === 'object'}
					{#if value.__is === 'function'}
						<span class="function">function {value.name || ''}()</span>
						{#if expanded[key]}<pre style:width="100%">{value.source}</pre>{/if}
					{:else if value.__is === 'symbol'}
						<span class="symbol">{value.name || 'Symbol()'}</span>
					{:else if Object.keys(value).length}
						<span class="object">Object &lbrace;&hellip;&rbrace;</span>

						{#if expanded[key]}
							<PropertyList entries={Object.values(value)} {keys} />
						{/if}
					{:else}
						<span class="object">Object &lbrace; &rbrace;</span>
					{/if}
				{/if}
			</li>
		{/each}
	</ul>
{:else}
	<div style:padding-left="1rem" style:color="rgb(118, 118, 118)">None</div>
{/if}

<style>
	ul {
		width: 100%;
		display: grid;
		gap: 0.25rem;
		padding-left: 1rem;
		margin-top: 0.25rem;
		font-size: 0.75rem;
	}

	li {
		position: relative;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		padding: 0.25rem;
		border-radius: 0.25rem;

		&:hover {
			background: rgba(135, 135, 137, 0.075);
		}
		&[data-tooltip] {
			background: rgba(179, 0, 0, 0.8);
		}
	}

	.function,
	.symbol,
	.object {
		color: rgb(0, 116, 232);
	}

	:global(.dark) {
		.function,
		.symbol,
		.object {
			color: rgb(117, 191, 255);
		}
	}
</style>
