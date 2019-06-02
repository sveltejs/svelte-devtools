<script>
  import { hoveredNodeId, rootNodes } from './store.js'
  import ComponentView from './ComponentView.svelte'
  import Node from './nodes/Node.svelte'
</script>

<style>
  ul {
    overflow: auto;
    flex-grow: 1;
    margin-top: 8px;
  }

  p {
    position: absolute;
    top: 40%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
</style>

{#if $rootNodes.length}
  <ul on:mouseleave={e => ($hoveredNodeId = null)}>
    {#each $rootNodes as node (node.id)}
      <Node {node} />
    {/each}
  </ul>
  <ComponentView />
{:else}
  <p>
    Refresh the page to connect to&nbsp;
    <b>svelte</b>
    .
  </p>
{/if}
