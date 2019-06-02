<script>
  import { createEventDispatcher } from 'svelte'

  const dispatch = createEventDispatcher()
</script>

<button type="button" on:click={() => dispatch('click', 'I was clicked!')}>
  Click me!
</button>
