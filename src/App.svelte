<script>
  import { rootNodes } from './store.js'
  import ComponentView from './ComponentView.svelte'
  import Node from './Node.svelte'
</script>

<style>
  div {
    flex-grow: 1;
  }

  p {
    position: absolute;
    top: 40%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
</style>

{#if $rootNodes.length}
  <div>
    {#each $rootNodes as node (node.id)}
      <Node {...node} />
    {/each}
  </div>
  <ComponentView />
{:else}
  <p>
    Refresh the page to connect to
    <b>svelte</b>
    .
  </p>
{/if}
