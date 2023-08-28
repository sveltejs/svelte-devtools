<script>
	import { devtools } from 'chrome';
	import CollapsableValue from './CollapsableValue.svelte';

	export let header;
	export let entries = [];
	export let id;
	export let readOnly = false;

	let errorMessages = {};
	function change(key, value) {
		devtools.inspectedWindow.eval(
			`__svelte_devtools_inject_state(${id}, '${key}', ${value})`,
			(result, error) =>
				(errorMessages[key] =
					error && error.isException
						? error.value.substring(0, error.value.indexOf('\n'))
						: undefined),
		);
	}
</script>

<h1>{header}</h1>

{#if entries.length}
	<ul>
		{#each entries as { key, value } (key)}
			<CollapsableValue
				errorMessage={errorMessages[key]}
				{readOnly}
				{key}
				{value}
				on:change={(e) => change(key, e.detail)}
			/>
		{/each}
	</ul>
{:else}
	<div class="empty">None</div>
{/if}

<style>
	.empty {
		margin: 0.667rem /* 8px */ 0 0 1rem /* 12px */;
		color: rgb(118, 118, 118);
	}

	h1 {
		margin: 0.667rem /* 8px */ 0 0 0.667rem /* 8px */;
		color: rgb(118, 118, 118);
		font-weight: bold;
		font-size: 0.917rem;
	}

	ul {
		margin: 0.417rem /* 5px */;
	}

	ul,
	div {
		margin-bottom: 1.667rem /* 20px */;
	}
</style>
