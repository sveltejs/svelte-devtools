<script>
  import {
    searchResult,
    searchValue,
    hoveredNodeId,
    rootNodes
  } from './store.js'
  import ComponentView from './ComponentView.svelte'
  import Toolbar from './Toolbar.svelte'
  import VisibilityButton from './VisibilityButton.svelte'
  import Node from './nodes/Node.svelte'
</script>

<style>
  .root {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
  }

  input {
    display: inline-block;
    margin-right: 5px;
    padding: 0 10px 0 22px;
    height: 22px;
    border: 1px solid rgb(224, 224, 226);
    border-radius: 2px;
    background: 6px center / 12px no-repeat url('/devtools/search.svg') #ffffff;
    font-size: inherit;
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

  p {
    position: absolute;
    top: 40%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
</style>

{#if $rootNodes.length}
  <div class="root">
    <Toolbar>
      <input placeholder="Search Tree" bind:value={$searchValue} />
      <VisibilityButton />
    </Toolbar>
    {#if $searchResult}
      {#if $searchResult.length}
        <ul class="results" on:mouseleave={e => ($hoveredNodeId = null)}>
          {#each $searchResult as node (node.id)}
            <Node {node} forceCollapsed={true} />
          {/each}
        </ul>
      {:else}
        <div>No results</div>
      {/if}
    {:else}
      <ul on:mouseleave={e => ($hoveredNodeId = null)}>
        {#each $rootNodes as node (node.id)}
          <Node {node} />
        {/each}
      </ul>
    {/if}
  </div>
  <ComponentView />
{:else}
  <p>
    Refresh the page to connect to&nbsp;
    <b>svelte</b>
    .
  </p>
{/if}
