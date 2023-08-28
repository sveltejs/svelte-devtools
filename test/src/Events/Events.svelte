<script>
	import EventsComponent from './EventsComponent.svelte';
</script>

<div on:keypress|capture={(e) => console.log('Captured a key', e)}>
	<p>Render event listeners on elements and components.</p>

	<EventsComponent on:click={(e) => console.log(e.detail)} />
</div>
