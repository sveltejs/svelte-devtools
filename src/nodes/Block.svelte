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
  }

  span {
    color: rgb(0, 116, 232);
  }

  .selected,
  .selected span,
  .hover.selected {
    background-color: rgb(0, 116, 232);
    color: #ffffff;
  }

  .hover {
    background-color: #f0f9fe;
  }

  div {
    color: rgb(151, 164, 179);
  }
</style>

<div class="tag-open tag-name" class:hover class:selected {style}>
  <Collapse {selected} bind:collapsed />
  &lbrace;#{tagName}&rbrace;
  {#if selected}
    &nbsp== $s
  {/if}
</div>
{#if !collapsed}
  <slot />
{/if}
<div class="tag-close tag-name" class:hover {style}>
  &lbrace;/{tagName}&rbrace;
</div>
