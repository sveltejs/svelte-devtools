<script>
  export let key
  export let value

  function select(element) {
    const selection = window.getSelection()
    selection.removeAllRanges()

    const range = document.createRange()
    range.selectNodeContents(element)
    selection.addRange(range)
  }

  let valueElement
  $: if (valueElement) valueElement.textContent = JSON.stringify(value)
</script>

<style>
  div {
    display: flex;
    margin-left: 12px;
  }

  span {
    flex-grow: 1;
    white-space: pre;
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

<div>
   {key}:&nbsp;
  <span
    class={typeof value}
    contenteditable
    bind:this={valueElement}
    on:focus={e => select(e.target)}
    on:keydown={e => e.key == 'Enter' && e.target.blur()}
    on:blur />
</div>
