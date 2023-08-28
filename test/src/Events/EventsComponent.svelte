<script>
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();
	const handler = () => dispatch('click', 'I was clicked!');
</script>

<button type="button" on:click|once|stopPropagation|preventDefault={handler}> Click me! </button>
