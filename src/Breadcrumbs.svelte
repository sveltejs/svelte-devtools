<script>
  import { selectedNode } from './store.js'

  let breadcrumbList = []
  $: {
    let node = $selectedNode

    if (!breadcrumbList.find(o => o.id == node.id)) {
      breadcrumbList = []
      while (node && node.tagName) {
        breadcrumbList.unshift(node)
        node = node.parent
      }
    }
  }
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

  li:last-child div {
    display: none;
  }
</style>

{#if breadcrumbList.length > 1}
  <ul>
    {#each breadcrumbList as node}
      <li
        on:click={e => ($selectedNode = node)}
        class:selected={node.id == $selectedNode.id}>
        {node.tagName}
        <div />
      </li>
    {/each}
  </ul>
{/if}
