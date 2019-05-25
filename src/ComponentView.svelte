<script>
  import { selectedCtx } from './store.js'
  import { devtools } from 'browser'
  import StateProperty from './StateProperty.svelte'

  function setState(key, value) {
    devtools.inspectedWindow.eval(
      `setSvelteState(${$selectedCtx.id}, '${key}', ${value})`
    )
  }
</script>

<style>
  div {
    border-left: 1px solid rgba(0, 0, 0, 0.1);
    padding: 5px;
    width: 300px;
  }
</style>

{#if $selectedCtx}
  <div>
    <h1>State</h1>
    {#each Object.entries($selectedCtx.properties.ctx) as [key, value] (key)}
      <StateProperty
        {key}
        {value}
        on:blur={e => setState(key, e.target.textContent)} />
    {/each}
  </div>
{/if}
