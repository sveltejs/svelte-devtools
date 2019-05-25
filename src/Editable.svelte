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
  li {
    display: flex;
    margin-left: 12px;
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

<li>
   {key}:&nbsp;
  <pre
    class={typeof value}
    contenteditable
    bind:this={valueElement}
    on:focus={e => select(e.target)}
    on:keydown={e => e.key == 'Enter' && e.target.blur()}
    on:blur />
</li>
