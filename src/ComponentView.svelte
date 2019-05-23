<script>
  import { selectedComponent } from './store.js'
</script>

<style>
  .root {
    padding: 5px;
    width: 300px;
    border-left: 1px solid rgba(0, 0, 0, 0.1);
  }
</style>

{#if $selectedComponent}
  <div class="root">
    <h1>State</h1>
    {#each Object.entries($selectedComponent.properties.ctx) as [key, value] (key)}
      <div>{key}: {JSON.stringify(value)}</div>
    {/each}
  </div>
{/if}
