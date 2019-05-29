<script>
  let valueList = ['a', 'b', 'c']
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
