<script>
  import { devtools } from 'chrome'
  import { selectedNode } from './store.js'
  import PropertyList from './PropertyList.svelte'
  import Toolbar from './Toolbar.svelte'

  let isResizing = false
  let width = 300
</script>

<style>
  .root {
    position: relative;
    overflow-y: auto;
    flex: 0 0 auto;
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
</style>

<svelte:window
  on:mousemove={e => isResizing && (width = window.innerWidth - e.x)}
  on:mouseup={e => (isResizing = false)} />

<div class="root" style={`width: ${width}px`}>
  <div class="resize" on:mousedown={e => (isResizing = true)} />
  <Toolbar>
    <button
      disabled={$selectedNode.id === undefined}
      on:click={e => devtools.inspectedWindow.eval('inspect(window.$s)')}>
      <img src="/devtools/tool-inspector.svg" alt="Inspect" title="Inspect" />
    </button>
  </Toolbar>
  {#if $selectedNode.type == 'component'}
    <PropertyList
      id={$selectedNode.id}
      header="Props"
      entries={$selectedNode.detail.attributes} />
    <PropertyList
      id={$selectedNode.id}
      header="State"
      entries={$selectedNode.detail.ctx} />
  {:else if $selectedNode.type == 'block' || $selectedNode.type == 'iteration'}
    <PropertyList
      readOnly
      id={$selectedNode.id}
      header="State"
      entries={$selectedNode.detail.ctx} />
  {:else if $selectedNode.type == 'element'}
    <PropertyList
      readOnly
      id={$selectedNode.id}
      header="Attributes"
      entries={$selectedNode.detail.attributes} />
  {/if}
</div>
