<script>
  export let selected = false
  export let collapsed
</script>

<style>
  span {
    position: relative;
    display: inline-block;
    width: 15px;
    height: 100%;
    vertical-align: bottom;
    cursor: pointer;
  }

  span::after {
    position: absolute;
    bottom: 5px;
    left: 4px;
    width: 0;
    height: 0;
    border-top: 5px solid rgba(135, 135, 137, 0.9);
    border-right: 4px solid transparent;
    border-left: 4px solid transparent;
    content: '';
    transition: transform 0.3s;
    transform: rotate(0deg);
  }

  span.selected::after {
    border-top-color: #ffffff;
  }

  span.collapsed::after {
    transform: rotate(-90deg);
  }
</style>

<span class:selected class:collapsed on:click={e => (collapsed = !collapsed)} />
