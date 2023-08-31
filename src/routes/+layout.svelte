<script lang="ts">
	import '../app.css';

	// import Profiler from '$lib/profiler/Profiler.svelte';
	import ConnectMessage from './ConnectMessage.svelte';
	import ReloadExtension from './ReloadExtension.svelte';

	import { rootNodes } from '$lib/store';
</script>

<svelte:window
	on:keydown={({ target }) => {
		if (target !== document.body) return;
	}}
/>

{#if $rootNodes.length}
	<!-- <Profiler /> -->

	<slot />
{:else}
	<ConnectMessage />
{/if}

<ReloadExtension />
