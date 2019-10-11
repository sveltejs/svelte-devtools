<script>
  import { tick } from 'svelte'
  import { selectedNode, hoveredNodeId, visibility } from './store.js'

  let root
  let breadcrumbList = []
  let shorttend

  async function setSelectedBreadcrumb(node) {
    if (breadcrumbList.find(o => o.id == node.id)) return

    breadcrumbList = []
    while (node && node.tagName) {
      breadcrumbList.unshift(node)
      node = node.parent
    }

    shorttend = false

    await tick()
    while (root && root.scrollWidth > root.clientWidth) {
      breadcrumbList.shift()
      shorttend = true
      breadcrumbList = breadcrumbList
      await tick()
    }
  }

  $: setSelectedBreadcrumb($selectedNode)
</script>

<style>
  ul {
    display: flex;
    align-items: center;
    height: 22px;
    border-top: 1px solid rgb(224, 224, 226);
  }

  li {
    display: flex;
    align-items: center;
    padding-left: 10px;
    cursor: pointer;
  }

  li.selected {
    color: rgb(0, 116, 232);
  }

  li:hover {
    opacity: 0.8;
  }

  li:last-child {
    padding-right: 10px;
  }

  li:last-child div {
    display: none;
  }

  div {
    position: relative;
    margin-left: 10px;
    width: 0;
    height: 0;
    border-top: 3.5px solid transparent;
    border-bottom: 3.5px solid transparent;
    border-left: 5px solid #8e8eb2;
  }

  div::after {
    position: absolute;
    top: -3.5px;
    left: -5px;
    display: block;
    width: 0;
    height: 0;
    border-top: 3.5px solid transparent;
    border-bottom: 3.5px solid transparent;
    border-left: 2px solid #ffffff;
    content: '';
  }

  :global(.dark) ul {
    border-top-color: rgb(60, 60, 61);
  }

  :global(.dark) div::after {
    border-left-color: rgba(135, 135, 137, 0.9);
  }
</style>

{#if breadcrumbList.length > 1}
  <ul bind:this={root}>
    {#if shorttend}
      <li>
        &hellip;
        <div />
      </li>
    {/if}
    {#each breadcrumbList as node}
      {#if $visibility[node.type]}
        <li
          on:click={e => ($selectedNode = node)}
          on:mouseover={e => ($hoveredNodeId = node.id)}
          class:selected={node.id == $selectedNode.id}>
          {node.tagName}
          <div />
        </li>
      {/if}
    {/each}
  </ul>
{/if}
