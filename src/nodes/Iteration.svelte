<script>
  export let style
  export let hover
  export let selected
</script>

<style>
  div {
    height: 1.455rem /* 16px */;
    line-height: 1.455rem /* 16px */;
  }

  div {
    color: rgb(151, 164, 179);
  }

  :global(.dark) div {
    color: rgb(175, 181, 191);
  }
</style>

<div class:hover class:selected {style}>&#8618;</div>
<slot />
