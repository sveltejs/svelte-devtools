<script>
  import EventsComponent from './EventsComponent.svelte'
</script>

<p>Render event listeners on elements and components.</p>

<EventsComponent on:click={e => console.log(e.detail)} />
