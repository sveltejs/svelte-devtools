<script>
  import { hoveredNode, rootNodes } from './store.js'
  import ComponentView from './ComponentView.svelte'
  import Node from './nodes/Node.svelte'
</script>

<style>
  div {
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
  <div on:mouseleave={e => ($hoveredNode = null)}>
    {#each $rootNodes as node (node.id)}
      <Node {...node} />
    {/each}
  </div>
  <ComponentView />
{:else}
  <p>
    Refresh the page to connect to&nbsp;
    <b>svelte</b>
    .
  </p>
{/if}
