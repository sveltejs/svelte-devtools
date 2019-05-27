<script>
  import Collapse from './Collapse.svelte'

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

  .attr-name {
    color: rgb(221, 0, 169);
  }

  .attr-value {
    display: inline-block;
    overflow: hidden;
    max-width: 200px;
    color: rgb(0, 62, 170);
    vertical-align: bottom;
    text-overflow: ellipsis;
    white-space: nowrap;
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
      <span class="attr-value">{JSON.stringify(value)}</span>
    {/each}
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
    {#each attributes as { name, value } (name)}
      &nbsp;
      <span class="attr-name">{name}</span>
      =
      <span class="attr-value">{JSON.stringify(value)}</span>
    {/each}
     &nbsp;/&gt;
  </div>
{/if}
