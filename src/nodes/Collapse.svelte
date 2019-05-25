<script>
  export let selected = false
  export let collapsed = false
</script>

<style>
  span {
    display: inline-block;
    overflow: hidden;
    margin-right: 3px;
    width: 6px;
    height: 14px;
    vertical-align: middle;
    font-size: 0.5rem;
    cursor: pointer;
    transition: transform 0.3s;
    transform: rotate(90deg);
  }

  span::after {
    position: absolute;
    top: 25%;
    right: 50%;
    bottom: 25%;
    left: -50%;
    display: block;
    border-radius: 1px;
    background-color: rgba(135, 135, 137, 0.9);
    content: '';
    transform: rotate(45deg);
  }

  span.selected::after {
    background-color: #ffffff;
  }

  span.collapsed {
    transform: rotate(0deg);
  }
</style>

<span class:selected class:collapsed on:click={e => (collapsed = !collapsed)} />
