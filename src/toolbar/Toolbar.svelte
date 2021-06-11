<div>
  <slot />
</div>

<style>
  div {
    display: flex;
    align-items: stretch;
    padding: 0 0.417rem /* 5px */;
    border-bottom: 0.083rem /* 1px */ solid rgb(224, 224, 226);
    background-color: rgb(249, 249, 250);
  }

  :global(.dark) div {
    border-bottom-color: rgb(60, 60, 61);
    /* #if process.env.TARGET === 'chrome'
    background-color: rgb(36, 36, 36);
    /* #else */
    background-color: rgb(42, 42, 46);
    /* #endif */
  }
</style>
