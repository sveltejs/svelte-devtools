<style>
  div {
    display: flex;
    align-items: stretch;
    padding: 0 0.455rem /* 5px */;
    border-bottom: 0.091rem /* 1px */ solid rgb(224, 224, 226);
    background-color: rgb(249, 249, 250);
  }

  :global(.dark) div {
    border-bottom-color: rgb(60, 60, 61);
    background-color: rgb(42, 42, 46);
  }

  :global(.dark.chrome) div {
    background-color: rgb(36, 36, 36);
  }
</style>

<div>
  <slot />
</div>
