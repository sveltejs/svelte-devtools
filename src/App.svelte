<script>
  import { rootNodes } from './store.js'
  import Node from './Node.svelte'
</script>

<style>
  p {
    position: absolute;
    top: 40%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
</style>

{#if $rootNodes.length}
  {#each $rootNodes as node (node.id)}
    <Node {...node} />
  {/each}
{:else}
  <p>
    Refresh the page to connect to
    <b>svelte</b>
    .
  </p>
{/if}
