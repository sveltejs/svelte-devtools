<script>
  import Editable from './Editable.svelte'

  export let entries = []
  export let id
  export let readOnly = false
</script>

<style>
  .empty {
    margin: 8px 0 0 12px;
    color: rgb(118, 118, 118);
  }
</style>

{#if entries.length}
  <ul>
    {#each entries as { key, value } (key)}
      <Editable {id} {key} {value} {readOnly} />
    {/each}
  </ul>
{:else}
  <div class="empty">None</div>
{/if}
