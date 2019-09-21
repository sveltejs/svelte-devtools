<script>
  export let style
</script>

<style>
  div {
    color: rgb(151, 164, 179);
  }

  :global(.dark) div {
    color: rgb(175, 181, 191);
  }
</style>

<div {style}>#anchor</div>
