<script>
  import Component from './Component.svelte'
</script>

<div>
  <ol>
    <li>Basic tree rendering</li>
    <li>Element attributes, component properties and state</li>
    <li>Text nodes / anchors</li>
  </ol>
  <Component string="value" number={0} array={[]} object={{}} />
</div>
