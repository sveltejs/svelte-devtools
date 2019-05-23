<script>
  import { selectedNode, selectedComponent } from './store.js'
  import Node from './Node.svelte'
  import Attributes from './Attributes.svelte'

  export let type
  export let id
  export let properties
  export let parent
  export let children

  let collapsed = false
</script>

<style>
  .root {
    position: relative;
    padding-left: 20px;
  }

  .root.selected {
    border-left: 2px solid lightgrey;
  }

  .collapse-button {
    position: absolute;
    left: 0;
    display: inline-block;
    font-size: 0.5rem;
    transition: transform 0.3s;
    transform: rotate(0deg);
  }

  .collapsed .collapse-button {
    transform: rotate(-90deg);
  }

  .selected > .tag-open,
  .selected > .tag-open .tag-name {
    background-color: #4056cc;
    color: #ffffff;
  }

  .tag-name {
    color: #3f85f1;
  }
</style>

<div
  class="root"
  class:selected={$selectedNode == id}
  class:collapsed
  on:click|stopPropagation={e => {
    $selectedNode = id
    let _type = type
    let node = { id, properties, parent }
    while (_type != 'component') {
      node = node.parent
    }
    selectedComponent.set(node)
  }}>
  {#if children.length}
    <span class="collapse-button" on:click={e => (collapsed = !collapsed)}>
      &#9660;
    </span>
    {#if type == 'each'}
      <div>{'{#each}'}</div>
      {#if !collapsed}
        {#each children as node (node.id)}
          <svelte:self {...node} />
        {/each}
      {/if}
      <div>{'{/each}'}</div>
    {:else}
      <div class="tag-open">
        &lt;
        <span class="tag-name">{properties.tagName}</span>
        <Attributes value={properties.attributes}/>
        &gt;
      </div>
      {#if !collapsed}
        {#each children as node (node.id)}
          <svelte:self {...node} />
        {/each}
      {/if}
      <div>
        &lt;/
        <span class="tag-name">{properties.tagName}</span>
        &gt;
      </div>
    {/if}
  {:else if type == 'text'}
    {properties.nodeValue}
  {:else if type == 'anchor'}
    anchor
  {:else if type == 'each'}
    {'{#each}{/each}'}
  {:else}
    <div class="tag-open">
      &lt;
      <span class="tag-name">{properties.tagName}</span>
      <Attributes value={properties.attributes}/>
      /&gt;
    </div>
  {/if}
</div>
