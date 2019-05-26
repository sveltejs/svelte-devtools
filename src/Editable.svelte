<script>
  import { devtools } from 'browser'

  export let id
  export let key
  export let value

  async function commit(e) {
    isEditing = false

    const [result, error] = await devtools.inspectedWindow.eval(
      `setSvelteState(${id}, '${key}', ${e.target.value})`
    )

    errorMessage =
      error && error.isException
        ? error.value.substring(0, error.value.indexOf('\n'))
        : undefined
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
    margin-left: 12px;
  }

  li[data-tooltip],
  li[data-tooltip] span {
    color: red;
  }

  span {
    flex-grow: 1;
    cursor: pointer;
  }

  input {
    flex-grow: 1;
    margin-right: 10px;
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
    <span class={typeof value} on:click={() => (isEditing = true)}>
      {JSON.stringify(value)}
    </span>
  {/if}
</li>
