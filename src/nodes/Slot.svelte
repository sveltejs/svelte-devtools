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
    color: rgb(0, 116, 232);
  }
</style>

<div
  class="tag-open tag-name"
  class:hover
  class:selected
  {style}
  on:dblclick={e => (collapsed = !collapsed)}>
  <Collapse {selected} bind:collapsed />
  &lt;{tagName}&gt;
  {#if collapsed}&hellip;&lt;/{tagName}&gt;{/if}
</div>
{#if !collapsed}
  <slot />
  <div class="tag-close tag-name" class:hover {style}>&lt;/{tagName}&gt;</div>
{/if}
