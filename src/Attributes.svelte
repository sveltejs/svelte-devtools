<script>
  export let value
</script>

<style>
  .attribute-key {
    color: #e21fb6;
  }

  .attribute-value {
    color: #4056cc;
  }
</style>

{#if value}
  {#each value as { name, value } (name)}
    <span class="attribute-key">{name}</span>
    =
    <span class="attribute-value">"{value}"</span>
  {/each}
{/if}
