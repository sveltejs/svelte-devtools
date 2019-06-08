<script>
  import Collapse from './Collapse.svelte'

  export let style
  export let hasChildren
  export let hover
  export let selected
  export let highlighted
  export let tagName
  export let attributes = []
  export let listeners = []
  export let collapsed
</script>

<style>
  div {
    line-height: 16px;
  }

  .tag-name {
    color: rgb(0, 116, 232);
  }

  .attr-name {
    position: relative;
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

<!--block attributes-->
{#each attributes as { key, value, isBound } (key)}
  &nbsp;
  <span class="attr-name">
    {#if isBound}bind:{/if}
    {key}
  </span>
  =
  <span class="attr-value">{JSON.stringify(value)}</span>
{/each}

{#each listeners as { type, handler, options } (type)}
  &nbsp;
  <span class="attr-name" data-tooltip={handler}>
    on:{type}
    {#if options}|{options.join('|')}{/if}
  </span>
{/each}
<!--end-->

{#if hasChildren}
  <div
    class:hover
    class:selected
    {style}
    on:dblclick={e => (collapsed = !collapsed)}>
    <Collapse {selected} bind:collapsed />
    &lt;
    <span class="tag-name">{tagName}</span>
    <!--use attributes-->
    &gt;
    {#if collapsed}
      &mldr;&lt;/
      <span class="tag-name">{tagName}</span>
      &gt;
    {/if}
  </div>
  {#if !collapsed}
    <slot />
    <div class:hover {style}>
      &lt;/
      <span class="tag-name">{tagName}</span>
      &gt;
    </div>
  {/if}
{:else}
  <div class:hover class:selected {style}>
    &lt;
    <span class="tag-name">{tagName}</span>
    <!--use attributes-->
    &nbsp;/&gt;
  </div>
{/if}
