<script>
  import { selectedCtx } from './store.js'
  import { devtools } from 'browser'
  import Editable from './Editable.svelte'

  function setState(key, value) {
    devtools.inspectedWindow.eval(
      `setSvelteState(${$selectedCtx.id}, '${key}', ${value})`
    )
  }
</script>

<style>
  div {
    overflow-y: auto;
    padding: 8px;
    width: 300px;
    border-left: 1px solid rgb(224, 224, 226);
    color: rgb(57, 63, 76);
    line-height: 2;
  }

  h1 {
    margin: 0;
    color: rgb(118, 118, 118);
    font-weight: bold;
    font-size: 1rem;
  }

</style>

{#if $selectedCtx}
  <div>
    <h1>State</h1>
    {#each Object.entries($selectedCtx.properties.ctx) as [key, value] (key)}
      <Editable
        {key}
        {value}
        on:blur={e => setState(key, e.target.textContent)} />
    {/each}
  </div>
{/if}
