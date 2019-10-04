<script>
  import { hoveredNodeId, rootNodes } from './store.js'
  import Toolbar from './toolbar/Toolbar.svelte'
  import Search from './toolbar/Search.svelte'
  import VisibilityButton from './toolbar/VisibilityButton.svelte'
  import ComponentView from './ComponentView.svelte'
  import Breadcrumbs from './Breadcrumbs.svelte'
  import ConnectMessage from './ConnectMessage.svelte'
  import Node from './nodes/Node.svelte'
</script>

<style>
  .node-tree {
    display: flex;
    flex: 1 1 0;
    flex-direction: column;
  }

  ul {
    overflow: auto;
    flex-grow: 1;
    margin-top: 8px;
  }

  .results :global(> li) {
    margin-bottom: 10px;
    padding-bottom: 10px;
    border-bottom: 1px solid rgb(242, 242, 243);
  }

  .results :global(> li:last-child) {
    border-bottom: none;
  }

  .root div {
    margin-top: 40%;
    text-align: center;
  }

  :global(.dark) input,
  :global(.dark) .results :global(> li) {
    border-color: rgb(60, 60, 61);
  }
</style>

{#if $rootNodes.length}
  <div class="node-tree">
    <Toolbar>
      <Search />
      <VisibilityButton />
    </Toolbar>
    <ul on:mouseleave={e => ($hoveredNodeId = null)}>
      {#each $rootNodes as node (node.id)}
        <Node {node} />
      {/each}
    </ul>
    <Breadcrumbs />
  </div>
  <ComponentView />
{:else}
  <ConnectMessage />
{/if}
