<script>
	import { profilerEnabled } from '../store.js';
	import Button from './Button.svelte';
</script>

<Button on:click={() => ($profilerEnabled = !$profilerEnabled)}>
	{#if $profilerEnabled}
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
			<path d="M12.7,1.4 11.3,0l-8,8 8,8 1.4,-1.4L6,8Z" />
		</svg>
	{:else}
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
			<path d="M0,4.8H3.4V16H0ZM6.4,0H9.6V16H6.4Zm6.4,9H16V16h-3.2z" />
		</svg>
	{/if}
</Button>
