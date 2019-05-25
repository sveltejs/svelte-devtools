<script>
  import Collapse from './Collapse.svelte'

  export let style
  export let hasChildren
  export let hover
  export let selected
  export let highlighted
  export let tagName
  export let attributes = {}

  let collapsed
</script>

<style>
  div {
    height: 16px;
  }

  span {
    color: rgb(0, 116, 232);
  }

  .attr-name {
    color: rgb(221, 0, 169);
  }

  .attr-value {
    color: rgb(0, 62, 170);
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
</style>

{#if hasChildren}
  <div class:hover class:selected {style}>
    <Collapse {selected} bind:collapsed />
    &lt;
    <span>{tagName}</span>
    {#each attributes as { name, value } (name)}
      &nbsp;
      <span class="attr-name">{name}</span>
      =
      <span class="attr-value">"{value}"</span>
    {/each}
    &gt;
    {#if collapsed}
      &lt;/
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
  <div class:hover class:selected class:highlighted {style}>
    &lt;
    <span>{tagName}</span>
    {#each attributes as { name, value } (name)}
      &nbsp;
      <span class="attr-name">{name}</span>
      =
      <span class="attr-value">"{value}"</span>
    {/each}
     /&gt;
  </div>
{/if}
