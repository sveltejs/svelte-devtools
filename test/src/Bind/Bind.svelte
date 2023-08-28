<script>
	import BindComponent from './BindComponent.svelte';

	let value;
</script>

<div>
	<p>
		Prepend 'bind' for bound Component binding. Note: element binds are simple implicit event
		handlers
	</p>
	<BindComponent bind:value />
	<input on:change={(e) => console.log(e)} />
</div>
