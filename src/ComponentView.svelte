<script>
  import { selectedComponent } from './store.js'
  import { devtools } from 'browser'

  function select(element) {
    setTimeout(() => {
      const selection = window.getSelection()
      selection.removeAllRanges()

      const range = document.createRange()
      range.selectNodeContents(element)
      selection.addRange(range)
    })
  }

  function setState(key, value) {
    devtools.inspectedWindow
      .eval(`setSvelteState(${$selectedComponent.id}, '${key}', ${value})`)
  }
</script>

<style>
  .root {
    padding: 5px;
    width: 300px;
    border-left: 1px solid rgba(0, 0, 0, 0.1);
  }

  .root div {
    display: flex;
  }

  span {
    flex-grow: 1;
  }
</style>

{#if $selectedComponent}
  <div class="root">
    <h1>State</h1>
    {#each Object.entries($selectedComponent.properties.ctx) as [key, value] (key)}
      <div>
         {key}:
        <span
          contenteditable
          on:focus={e => select(e.target)}
          on:keydown={e => e.key == 'Enter' && e.target.blur()}
          on:blur={e => setState(key, e.target.innerText)}>
           {JSON.stringify(value)}
        </span>
      </div>
    {/each}
  </div>
{/if}
