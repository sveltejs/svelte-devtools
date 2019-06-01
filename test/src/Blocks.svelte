<script>
  let valueList = ['a', 'b', 'c']

  let value = 0
  setTimeout(() => (value = 1), 0)
</script>

<div>
  <p>
    Renders &lbrace;#each&rbrace; and &lbrace;#if&rbrace; blocks with original
    source line
  </p>

  {#each valueList as value}
    <span>{value}</span>
  {/each}

  <br />

  {#if value > 10}
    Value is over 10
  {:else if value > 5}Value is over 5{:else}Value is under 5{/if}
</div>
