<script>
  import { devtools } from 'chrome'
  import { selectedNode } from './store.js'
  import EditableList from './EditableList.svelte'
  import VisibilityButton from './VisibilityButton.svelte'

  let isResizing = false
  let width = 300
</script>

<style>
  .root {
    position: relative;
    overflow-y: auto;
    color: rgb(57, 63, 76);
  }

  .resize {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: 5px;
    border-left: 1px solid rgb(224, 224, 226);
    cursor: ew-resize;
  }

  .resize:hover {
    border-color: rgb(177, 177, 179);
  }

  .toolbar {
    padding: 0 5px;
    border-bottom: 1px solid rgb(224, 224, 226);
    background-color: rgb(249, 249, 250);
    text-align: right;
  }

  .toolbar :global(button) {
    margin: 1px;
    padding: 5px;
    border: none;
    border-radius: 2px;
    background-color: transparent;
    line-height: 0;
    cursor: pointer;
  }

  .toolbar :global(button:hover) {
    background-color: rgb(237, 237, 240);
  }

  .toolbar :global(img) {
    width: 16px;
    height: 16px;
    vertical-align: middle;
    opacity: 0.8;
  }

  h1 {
    margin: 8px 0 0 8px;
    color: rgb(118, 118, 118);
    font-weight: bold;
    font-size: 1rem;
  }

  h1.state-header {
    margin-top: 20px;
  }

  li {
    margin-left: 12px;
  }

  span {
    color: rgb(102, 153, 0);
  }
</style>

<svelte:window
  on:mousemove={e => isResizing && (width = window.innerWidth - e.x)}
  on:mouseup={e => (isResizing = false)}
/>

{#if $selectedNode}
  <div class="root" style={`width: ${width}px`}>
    <div class="resize" on:mousedown={e => (isResizing = true)} />
    <div class="toolbar">
      <VisibilityButton />
      <button
        on:click={e => devtools.inspectedWindow.eval('inspect(window.$s)')}
      >
        <img src="/devtools/tool-inspector.svg" alt="Inspect" title="Inspect" />
      </button>
    </div>
    {#if $selectedNode.type == 'component'}
      <h1>Props</h1>
      <EditableList
        id={$selectedNode.id}
        entries={$selectedNode.detail.attributes}
      />
      <h1 class="state-header">State</h1>
      <EditableList id={$selectedNode.id} entries={$selectedNode.detail.ctx} />
    {:else if $selectedNode.type == 'block'}
      <h1>State</h1>
      <EditableList
        readOnly
        id={$selectedNode.id}
        entries={$selectedNode.detail.ctx}
      />
    {:else if $selectedNode.type == 'element'}
      <h1>Attributes</h1>
      <EditableList
        readOnly
        id={$selectedNode.id}
        entries={$selectedNode.detail.attributes}
      />
    {/if}
  </div>
{/if}
