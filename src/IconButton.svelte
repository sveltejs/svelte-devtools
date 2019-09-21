<script>
  export let disabled
</script>

<style>
  button {
    position: relative;
    z-index: 1;
    margin: 1px;
    padding: 5px;
    outline: none;
    border: none;
    border-radius: 2px;
    background-color: transparent;
    line-height: 0;
    cursor: pointer;
  }

  button:hover {
    background-color: rgb(237, 237, 240);
  }

  button:active:hover {
    color: inherit;
  }

  button:active :global(svg) {
    fill: rgba(12, 12, 13, 0.8);
  }

  button:disabled :global(svg) {
    fill: rgba(12, 12, 13, 0.2);
  }

  :global(svg) {
    width: 16px;
    height: 16px;
    vertical-align: middle;
    opacity: 0.8;
    fill: rgb(12, 12, 13);
  }

  :global(.dark) button:hover {
    background-color: rgb(37, 37, 38);
  }

  :global(.dark) :global(svg) {
    fill: rgba(249, 249, 250, 0.7);
  }

  :global(.dark) button:active :global(svg) {
    fill: rgba(249, 249, 250, 0.8);
  }

  :global(.dark) button:disabled :global(svg) {
    fill: rgba(249, 249, 250, 0.2);
  }

  :global(.dark) button:disabled,
  button:disabled {
    background-color: transparent;
    cursor: default;
  }
</style>

<button on:click {disabled}>
  <slot />
</button>
