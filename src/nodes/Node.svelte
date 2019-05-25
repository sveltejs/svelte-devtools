<script>
  import { hoveredNode, selectedNode, selectedCtx } from '../store.js'
  import Element from './Element.svelte'
  import Block from './Block.svelte'
  import Text from './Text.svelte'
  import Anchor from './Anchor.svelte'

  export let type
  export let id
  export let properties
  export let parent
  export let children

  export let depth = 1

  const nodeTypes = {
    element: Element,
    component: Element,
    block: Block,
    text: Text,
    anchor: Anchor
  }

  let hover = false
</script>

<style>
  div {
    position: relative;
  }

  span {
    position: absolute;
    top: 1.6em;
    bottom: 1.6em;
    z-index: 1;
    width: 2px;
    background-color: #e0e0e2;
  }
</style>

<div
  on:mouseover|stopPropagation={e => ($hoveredNode = id)}
  on:click|stopPropagation={e => {
    $selectedNode = id
    let node = { id, type, properties, parent }
    while (node && node.properties && !node.properties.ctx) {
      node = node.parent
    }
    $selectedCtx = node
  }}>
  <svelte:component
    this={nodeTypes[type]}
    {...properties}
    hasChildren={children.length != 0}
    hover={$hoveredNode == id}
    selected={$selectedNode == id}
    style={`padding-left: ${depth * 12}px`}>
    {#if $selectedNode == id}
      <span style={`left: ${depth * 12 + 2}px`} />
    {/if}
    {#each children as node (node.id)}
      <svelte:self {...node} depth={depth + 1} />
    {/each}
  </svelte:component>
</div>
