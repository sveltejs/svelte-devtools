<script>
  import { devtools } from 'browser'
  import { selectedNode } from './store.js'
  import Editable from './Editable.svelte'
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

  li {
    margin-left: 12px;
  }

  span {
    color: rgb(102, 153, 0);
  }
</style>

{#if $selectedNode}
  <div>
    {#if $selectedNode.type == 'component' || $selectedNode.type == 'block'}
      <h1>State</h1>
      <ul>
        {#each Object.entries($selectedNode.properties.ctx) as [key, value] (key)}
          <Editable id={$selectedNode.id} {key} {value} />
        {/each}
      </ul>
    {:else if $selectedNode.type == 'element'}
      <h1>Attributes</h1>
      <ul>
        {#each $selectedNode.properties.attributes as { name, value } (name)}
          <li>
            {name}:
            &nbsp;
            <span>"{value}"</span>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
{/if}
