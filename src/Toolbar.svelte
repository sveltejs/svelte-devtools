<style>
  div {
    padding: 0 5px;
    border-bottom: 1px solid rgb(224, 224, 226);
    background-color: rgb(249, 249, 250);
    text-align: right;
  }

  :global(.dark) div {
    border-bottom-color: rgb(60, 60, 61);
    background-color: rgb(42, 42, 46);
  }
</style>

<div>
  <slot />
</div>
