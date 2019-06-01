<script>
  import Collapse from './Collapse.svelte'

  export let style
  export let hover
  export let selected
  export let tagName
  export let source
  export let collapsed
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
  {#if source}{source}{:else}&lbrace;#{tagName}&rbrace;{/if}
  {#if collapsed}...&lbrace;/{tagName}&rbrace;{/if}
</div>
{#if !collapsed}
  <slot />
  <div class="tag-close tag-name" class:hover {style}>
    &lbrace;/{tagName}&rbrace;
  </div>
{/if}
