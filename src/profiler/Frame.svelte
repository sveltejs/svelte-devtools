<script>
	import Operation from './Operation.svelte';

	export let children;
	export let duration;
</script>

{#if children}
	<ul>
		{#each children as child, i}
			<li style="width: {(child.duration / duration) * 100}%">
				<Operation frame={child} on:click />
				<svelte:self {...child} on:click />
			</li>
		{/each}
	</ul>
{/if}

<style>
	ul {
		display: flex;
	}

	li {
		flex: 0 1 auto;
		min-width: 0.417rem /* 5px */;
	}
</style>
