<script>
  import BasicTree from './BasicTree/BasicTree.svelte'
  import Detach from './Detach/Detach.svelte'
  import Blocks from './Blocks.svelte'
  import Bind from './Bind/Bind.svelte'
</script>

<style>
  div > :global(div) {
    margin-bottom: 20px;
    padding-bottom: 20px;
    border-bottom: 1px solid lightgray;
  }

  div :global(p) {
    margin: 20px;
    padding: 10px;
    background-color: beige;
  }

  div :global(ol) {
    margin: -20px 20px 20px;
    padding-bottom: 10px;
    background-color: beige;
  }

  div :global(ol:first-child) {
    margin-top: 20px;
    padding-top: 10px;
  }
</style>

<div>
  <BasicTree />
  <Detach />
  <Blocks />
  <Bind />
</div>
