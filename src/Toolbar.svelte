<style>
  div {
    padding: 0 5px;
    border-bottom: 1px solid rgb(224, 224, 226);
    background-color: rgb(249, 249, 250);
    text-align: right;
  }

  div :global(button) {
    margin: 1px;
    padding: 5px;
    outline: none;
    border: none;
    border-radius: 2px;
    background-color: transparent;
    line-height: 0;
    cursor: pointer;
  }

  div :global(button:hover) {
    background-color: rgb(237, 237, 240);
  }

  div :global(button:active) {
    opacity: 0.8;
  }

  div :global(button:disabled) {
    background-color: transparent;
    opacity: 0.2;
    cursor: default;
  }

  div :global(img) {
    width: 16px;
    height: 16px;
    vertical-align: middle;
    opacity: 0.8;
  }
</style>

<div>
  <slot />
</div>
