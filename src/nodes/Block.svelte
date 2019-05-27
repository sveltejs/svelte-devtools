<script>
  import Collapse from './Collapse.svelte'

  export let style
  export let hover
  export let selected
  export let tagName

  let collapsed
</script>

<style>
  div {
    height: 16px;
    line-height: 16px;
  }

  div {
    color: rgb(151, 164, 179);
  }
</style>

<div class="tag-open tag-name" class:hover class:selected {style}>
  <Collapse {selected} bind:collapsed />
  &lbrace;#{tagName}&rbrace;
  {#if collapsed}...&lbrace;/{tagName}&rbrace;{/if}
</div>
{#if !collapsed}
  <slot />
  <div class="tag-close tag-name" class:hover {style}>
    &lbrace;/{tagName}&rbrace;
  </div>
{/if}
