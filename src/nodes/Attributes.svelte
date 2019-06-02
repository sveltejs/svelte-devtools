<script>
  export let attributes
  export let listeners
</script>

<style>
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

{#each attributes as { key, value, isBound } (key)}
  &nbsp;
  <span class="attr-name">
    {#if isBound}bind:{/if}
    {key}
  </span>
  =
  <span class="attr-value">{JSON.stringify(value)}</span>
{/each}

{#each listeners as { type, handler } (type)}
  &nbsp;
  <span class="attr-name" data-tooltip={handler}>on:{type}</span>
{/each}
