<script>
  let valueList = ['a', 'b', 'c']

  let counter = 0
  setInterval(() => (counter += 1), 5000)
</script>

<div>
  <p>
    Renders &lbrace;#each&rbrace; and &lbrace;#if&rbrace; blocks with original
    source line
  </p>

  {#each valueList as value}
    <span>{value}</span>
  {/each}
</div>
