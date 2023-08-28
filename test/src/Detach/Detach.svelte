<script>
	import DetachComponent from './DetachComponent.svelte';

	let isShown = false;
</script>

<div>
	<p>Component / element nodes are</p>
	<ol>
		<li>positioned correctly when mounted after first render</li>
		<li>removed when detached</li>
	</ol>

	{#if isShown}
		<DetachComponent />
		<div>Element renders below component and above button</div>
	{/if}

	<button on:click={(e) => (isShown = !isShown)}>Toggle</button>
</div>
