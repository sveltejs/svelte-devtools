<script>
  import { visibility } from './store.js'

  let isOpen = false
</script>

<style>
  button {
    position: relative;
  }

  div {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 1;
    cursor: default;
  }

  ul {
    position: absolute;
    top: 32px;
    right: -20px;
    z-index: 2;
    padding: 6px 0;
    border: 1px solid rgb(224, 224, 226);
    border-radius: 2px;
    background-color: #ffffff;
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075) !important;
    text-align: left;
    line-height: 1;
  }

  span {
    position: absolute;
    top: -12px;
    right: 20px;
    display: block;
    overflow: hidden;
    width: 23px;
    height: 12px;
  }

  span::before {
    position: absolute;
    top: 3px;
    left: 2px;
    display: block;
    width: 16px;
    height: 16px;
    border: 1px solid rgb(224, 224, 226);
    background-color: #ffffff;
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075) !important;
    content: '';
    transform: rotate(45deg);
  }

  li {
    position: relative;
    padding: 4px 10px 4px 28px;
  }

  li:hover {
    background-color: rgb(239, 239, 242);
  }

  li.checked::before {
    position: absolute;
    top: 0;
    left: 10px;
    display: block;
    width: 11px;
    height: 100%;
    background: center / contain no-repeat url('/devtools/check.svg');
    content: '';
  }
</style>

<button on:click={e => (isOpen = true)}>
  <img src="/devtools/visibility.svg" alt="Filter" title="Filter" />
  {#if isOpen}
    <div on:click|stopPropagation={e => (isOpen = false)} />
    <ul>
      <span />
      <li
        class:checked={$visibility.component}
        on:click={e => ($visibility.component = !$visibility.component)}>
        Components
      </li>
      <li
        class:checked={$visibility.element}
        on:click={e => ($visibility.element = !$visibility.element)}>
        Elements
      </li>
      <li
        class:checked={$visibility.block}
        on:click={e => ($visibility.block = !$visibility.block)}>
        Blocks
      </li>
      <li
        class:checked={$visibility.anchor}
        on:click={e => ($visibility.anchor = !$visibility.anchor)}>
        Anchors
      </li>
      <li
        class:checked={$visibility.text}
        on:click={e => ($visibility.text = !$visibility.text)}>
        Text
      </li>
    </ul>
  {/if}
</button>
