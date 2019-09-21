<script>
  import { reload } from './store.js'
</script>

<style>
  .root {
    position: absolute;
    top: 40%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .button {
    color: blue;
    cursor: pointer;
  }

  .button:hover {
    opacity: 0.6;
  }

  h1 {
    margin-top: 30px;
    margin-bottom: 8px;
    font-size: 1.4em;
  }

  ul {
    padding-left: 20px;
    list-style-type: disc;
  }

  li {
    margin-bottom: 8px;
  }

  :global(.dark) .button {
    color: rgb(117, 191, 255);
  }
</style>

<div class="root">
  <p>
    To connect to&nbsp;
    <b>Svelte</b>
    &nbsp;proform a hard refresh (ctrl+F5) or&nbsp;
    <span on:click={reload} class="button">click here</span>
    .
  </p>
  <h1>Not working? Did you...</h1>
  <ul>
    <li>Use Svelte version 3.12.0 or above?</li>
    <li>Build with dev mode enabled?</li>
  </ul>
</div>
