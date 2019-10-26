<script>
  import Collapse from './Collapse.svelte'
  import SearchTerm from './SearchTerm.svelte'

  export let style
  export let hasChildren
  export let hover
  export let selected
  export let highlighted
  export let tagName
  export let attributes = []
  export let listeners = []
  export let collapsed

  function stringify(value) {
    switch (typeof value) {
      case 'string':
        return `"${value}"`
      case 'undefined':
        return 'undefined'
      case 'number':
        return value != value ? 'NaN' : value.toString()
      case 'object':
        if (value == null) return 'null'
        if (Array.isArray(value)) return `[${value.map(stringify).join(', ')}]`
        if (value.__isFunction) return value.name + '()'
        if (value.__isSymbol) return value.name
        return `{${Object.entries(value)
          .map(([key, value]) => `${key}: ${stringify(value)}`)
          .join(', ')}}`
    }
  }

  let _attributes
  let cache = {}
  $: {
    let localCache = {}
    _attributes = attributes.map(o => {
      const value = stringify(o.value)
      localCache[o.key] = value

      return {
        ...o,
        value,
        flash: !!_attributes && value != cache[o.key]
      }
    })
    cache = localCache
  }
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

  :global(.dark) .tag-name {
    color: rgb(117, 191, 255);
  }

  :global(.dark) .attr-name {
    color: rgb(255, 125, 233);
  }

  :global(.dark) .attr-value {
    color: rgb(185, 142, 255);
  }
</style>

<!--block attributes-->
{#each _attributes as { key, value, isBound, flash } (key)}
  &nbsp;
  <span class:flash>
    <span class="attr-name">
      {#if isBound}bind:{/if}
      <SearchTerm text={key} />
    </span>
    =
    <span class="attr-value">
      <SearchTerm text={value} />
    </span>
  </span>
{/each}

{#each listeners as { event, handler, modifiers }}
  &nbsp;
  <span class="attr-name" data-tooltip={handler}>
    on:
    <SearchTerm text={event} />
    {#if modifiers}|{modifiers.join('|')}{/if}
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
    <span class="tag-name">
      <SearchTerm text={tagName} />
    </span>
    <!--use attributes-->
    &gt;
    {#if collapsed}
      &hellip;&lt;/
      <span class="tag-name">
        <SearchTerm text={tagName} />
      </span>
      &gt;
    {/if}
  </div>
  {#if !collapsed}
    <slot />
    <div class:hover {style}>
      &lt;/
      <span class="tag-name">
        <SearchTerm text={tagName} />
      </span>
      &gt;
    </div>
  {/if}
{:else}
  <div class:hover class:selected {style}>
    &lt;
    <span class="tag-name">
      <SearchTerm text={tagName} />
    </span>
    <!--use attributes-->
    &nbsp;/&gt;
  </div>
{/if}
