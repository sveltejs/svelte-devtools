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
  }

  span {
    flex-grow: 1;
  }
</style>

<div>
   {key}:
  <span
    contenteditable
    bind:this={valueElement}
    on:focus={e => select(e.target)}
    on:keydown={e => e.key == 'Enter' && e.target.blur()}
    on:blur />
</div>
