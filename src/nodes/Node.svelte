<script>
  import { visibility, hoveredNodeId, selectedNode } from '../store.js'
  import Element from './Element.svelte'
  import Block from './Block.svelte'
  import Text from './Text.svelte'
  import Anchor from './Anchor.svelte'

  export let node
  export let depth = 1

  let _timeout = null
  node.invalidate = () => {
    if (_timeout) return

    _timeout = setTimeout(() => {
      _timeout = null
      node = node
    }, 100)
  }

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

  li :global(.selected),
  li :global(.selected *),
  li :global(.hover.selected) {
    background-color: rgb(0, 116, 232);
    color: #ffffff;
  }

  li :global(> .selected::after) {
    content: ' == $s';
  }

  li :global(.hover) {
    background-color: #f0f9fe;
  }
</style>

{#if $visibility[node.type]}
  <li
    on:mouseover|stopPropagation={e => ($hoveredNodeId = node.id)}
    on:click|stopPropagation={e => ($selectedNode = node)}>
    <svelte:component
      this={nodeType}
      tagName={node.tagName}
      bind:collapsed={node.collapsed}
      {...node.detail}
      hasChildren={node.children.length != 0}
      hover={$hoveredNodeId == node.id}
      selected={$selectedNode.id == node.id}
      style={`padding-left: ${depth * 12}px`}>
      {#if $selectedNode.id == node.id}
        <span style={`left: ${depth * 12 + 2}px`} />
      {/if}
      <ul>
        {#each node.children as node (node.id)}
          <svelte:self {node} depth={depth + 1} />
        {/each}
      </ul>
    </svelte:component>
  </li>
{:else}
  {#each node.children as node (node.id)}
    <svelte:self {node} {depth} />
  {/each}
{/if}
