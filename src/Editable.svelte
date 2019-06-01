<script>
  import { devtools } from 'chrome'

  export let id
  export let key
  export let value
  export let readOnly

  async function commit(e) {
    isEditing = false

    devtools.inspectedWindow.eval(
      `__svelte_devtools_unsafe_set(${id}, '${key}', ${e.target.value})`,
      (result, error) =>
        (errorMessage =
          error && error.isException
            ? error.value.substring(0, error.value.indexOf('\n'))
            : undefined)
    )
  }

  let isEditing = false
  let errorMessage
  let input

  $: if (input) input.select()
</script>

<style>
  li {
    position: relative;
    display: flex;
    margin: 0 8px 0 12px;
    padding: 4px 0;
  }

  li[data-tooltip],
  li[data-tooltip] span {
    color: red;
  }

  span:not(.readOnly) {
    flex-grow: 1;
    cursor: pointer;
  }

  input {
    flex-grow: 1;
    margin-right: 10px;
    outline: none;
    border: none;
    box-shadow: 0 0 2px 1px rgba(0, 0, 0, 0.1);
    font-size: inherit;
  }

  .string {
    color: rgb(102, 153, 0);
  }

  .number {
    color: rgb(153, 0, 85);
  }

  .boolean {
    color: rgb(0, 119, 170);
  }

  .object {
    color: rgb(153, 153, 153);
  }
</style>

<li {...{ 'data-tooltip': errorMessage }}>
  {key}:&nbsp;
  {#if isEditing}
    <input
      bind:this={input}
      value={JSON.stringify(value)}
      on:keydown={e => e.key == 'Enter' && commit(e)}
      on:blur={commit}
    />
  {:else}
    <span
      class={typeof value}
      class:readOnly
      on:click={() => (isEditing = !readOnly)}
    >
      {JSON.stringify(value)}
    </span>
  {/if}
</li>
