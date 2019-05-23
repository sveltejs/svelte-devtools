<script>
  import { selectedComponent } from './store.js'
  import { devtools } from 'browser'
  import StateProperty from './StateProperty.svelte'

  function setState(key, value) {
    devtools.inspectedWindow.eval(
      `setSvelteState(${$selectedComponent.id}, '${key}', ${value})`
    )
  }
</script>

<style>
  div {
    padding: 5px;
    width: 300px;
    border-left: 1px solid rgba(0, 0, 0, 0.1);
  }
</style>

{#if $selectedComponent}
  <div>
    <h1>State</h1>
    {#each Object.entries($selectedComponent.properties.ctx) as [key, value] (key)}
      <StateProperty
        {key}
        {value}
        on:blur={e => setState(key, e.target.textContent)} />
    {/each}
  </div>
{/if}
