<script>
  import { hoveredNode, selectedNode, selectedCtx } from '../store.js'
  import Element from './Element.svelte'
  import Block from './Block.svelte'
  import Text from './Text.svelte'
  import Anchor from './Anchor.svelte'

  export let node
  export let depth = 1

  $: nodeType = {
    element: Element,
    component: Element,
    block: Block,
    text: Text,
    anchor: Anchor
  }[node.type]
</script>

<style>
  li {
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

<li
  on:mouseover|stopPropagation={e => ($hoveredNode = node.id)}
  on:click|stopPropagation={e => {
    $selectedNode = node.id
    let _node = node
    while (_node && _node.properties && !_node.properties.ctx) {
      _node = _node.parent
    }
    $selectedCtx = _node
  }}>
  <svelte:component
    this={nodeType}
    {...node.properties}
    hasChildren={node.children.length != 0}
    hover={$hoveredNode == node.id}
    selected={$selectedNode == node.id}
    style={`padding-left: ${depth * 12}px`}>
    {#if $selectedNode == node.id}
      <span style={`left: ${depth * 12 + 2}px`} />
    {/if}
    <ul>
      {#each node.children as node (node.id)}
        <svelte:self {node} depth={depth + 1} />
      {/each}
    </ul>
  </svelte:component>
</li>
