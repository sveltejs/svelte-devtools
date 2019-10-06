<script>
  import { rootNodes, selectedNode, searchValue } from '../store.js'
  import Button from './Button.svelte'

  function next() {
    if (resultsPosition >= results.length - 1) resultsPosition = -1
    selectedNode.set(results[++resultsPosition])
  }

  function prev() {
    if (resultsPosition <= 0) resultsPosition = results.length
    selectedNode.set(results[--resultsPosition])
  }

  function search(nodeList = $rootNodes) {
    for (const node of nodeList) {
      if (
        node.tagName.includes($searchValue) ||
        (node.detail && JSON.stringify(node.detail).includes($searchValue))
      )
        results.push(node)
      search(node.children)
    }
  }

  let results
  let resultsPosition
  $: {
    $searchValue
    results = []
    resultsPosition = -1
    if ($searchValue.length > 1) search()
  }
</script>

<style>
  form {
    display: flex;
    align-items: center;
    flex-grow: 1;
  }

  svg {
    margin: 4px 4px 4px 6px;
    width: 12px;
  }

  input {
    flex-grow: 1;
    outline: none;
    border: none;
    background: none;
    color: inherit;
    font-size: inherit;
  }

  .separator {
    margin: 0 5px;
    width: 1px;
    height: calc(100% - 10px);
    background-color: rgb(224, 224, 226);
  }

  :global(.dark) .separator {
    background-color: rgb(60, 60, 61);
  }

  .next,
  .prev {
    position: relative;
    display: block;
    margin: 5px;
    width: 5px;
    height: 5px;
    border-style: solid;
    transform: rotate(45deg);
  }

  .next {
    bottom: 2px;
    border-width: 0 1px 1px 0;
  }

  .prev {
    top: 2px;
    border-width: 1px 0 0 1px;
  }
</style>

<form on:submit|preventDefault={next}>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
    <path
      fill="rgba(135, 135, 137, 0.9)"
      d="M15.707 14.293l-5-5-1.414 1.414 5 5a1 1 0 0 0 1.414-1.414z" />
    <path
      fill="rgba(135, 135, 137, 0.9)"
      fill-rule="evenodd"
      d="M6 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm0 2A6 6 0 1 0 6 0a6 6 0 0 0 0 12z" />
  </svg>
  <input placeholder="Search" bind:value={$searchValue} />
  {#if resultsPosition > -1}
    {resultsPosition + 1}&nbsp;of&nbsp;{results.length}&nbsp;
  {/if}
  <Button type="submit" disabled={!results.length}>
    <div class="next" />
  </Button>
  <Button on:click={prev} disabled={!results.length}>
    <div class="prev" />
  </Button>
  <div class="separator" />
</form>
