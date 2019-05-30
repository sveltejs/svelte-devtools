<script>
  import Collapse from './Collapse.svelte'
  import Attributes from './Attributes.svelte'

  export let style
  export let hasChildren
  export let hover
  export let selected
  export let highlighted
  export let tagName
  export let attributes = []

  let collapsed
</script>

<style>
  div {
    height: 16px;
    line-height: 16px;
  }

  span {
    color: rgb(0, 116, 232);
  }
</style>

{#if hasChildren}
  <div class:hover class:selected {style}>
    <Collapse {selected} bind:collapsed />
    &lt;
    <span>{tagName}</span>
    <Attributes values={attributes} />
    &gt;
    {#if collapsed}
      ...&lt;/
      <span>{tagName}</span>
      &gt;
    {/if}
  </div>
  {#if !collapsed}
    <slot />
    <div class:hover {style}>
      &lt;/
      <span>{tagName}</span>
      &gt;
    </div>
  {/if}
{:else}
  <div class:hover class:selected {style}>
    &lt;
    <span>{tagName}</span>
    <Attributes values={attributes} />
    &nbsp;/&gt;
  </div>
{/if}
