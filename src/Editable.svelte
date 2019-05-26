<script>
  import { devtools } from 'browser'

  export let id
  export let key
  export let value

  async function setState() {
    const [result, error] = await devtools.inspectedWindow.eval(
      `setSvelteState(${id}, '${key}', ${valueElement.textContent})`
    )

    errorMessage =
      error && error.isException
        ? error.value.substring(0, error.value.indexOf('\n'))
        : undefined
  }

  function select(element) {
    const selection = window.getSelection()
    selection.removeAllRanges()

    const range = document.createRange()
    range.selectNodeContents(element)
    selection.addRange(range)
  }

  let errorMessage
  let valueElement
  $: if (valueElement) valueElement.textContent = JSON.stringify(value)
</script>

<style>
  li {
    position: relative;
    display: flex;
    margin-left: 12px;
  }

  li[data-tooltip],
  li[data-tooltip] pre {
    color: red;
  }

  pre {
    flex-grow: 1;
    margin: 0;
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

<li {...{ 'data-error': errorMessage }}>
   {key}:&nbsp;
  <pre
    class={typeof value}
    contenteditable
    bind:this={valueElement}
    on:focus={e => select(e.target)}
    on:keydown={e => e.key == 'Enter' && e.target.blur()}
    on:blur={setState} />
</li>
