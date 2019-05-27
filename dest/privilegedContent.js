;(function() {
  function unsafe_set(id, key, value) {
    let component = nodeMap.get(id)._real
    if (component.wrappedJSObject) component = component.wrappedJSObject
    component.$$.ctx.$$devtools_unsafe_set(key, value)
    ;(window.wrappedJSObject || window).make_dirty(component, key)
  }

  // Runs directly on page in chrome and as as content script in firefox
  try {
    const port = browser.runtime.connect()
    port.onMessage.addListener(handleMessage)
    window.postMessage = port.postMessage
    exportFunction(unsafe_set, window, {
      defineAs: '__svelte_devtools_unsafe_set'
    })
  } catch (err) {
    if (!(err instanceof ReferenceError)) throw err

    window.addEventListener('message', e => handleMessage(e.data), false)
    window.__svelte_devtools_unsafe_set = unsafe_set
  }

  function serializeDOM(node) {
    const obj = {
      nodeType: node.nodeType
    }

    if (node.tagName) obj.tagName = node.tagName.toLowerCase()
    else if (node.nodeName) obj.nodeName = node.nodeName

    if (node.nodeValue) obj.nodeValue = node.nodeValue

    if (node.attributes)
      obj.attributes = Array.from(node.attributes).map(attr => ({
        name: attr.name,
        value: attr.value
      }))

    if (node.childNodes)
      obj.childNodes = Array.from(node.childNodes).map(serializeDOM)

    return obj
  }

  function serializeComponent(component) {
    return {
      tagName: component.tagName,
      ...serializeInternals(component.$$)
    }
  }

  function serializeInternals($$) {
    const ctx = JSON.parse(JSON.stringify($$.ctx))
    return {
      attributes: $$.props.map(name => {
        const value = ctx[name]
        delete ctx[name]
        return { name, value }
      }),
      ctx
    }
  }

  function serializeNode(node) {
    return { id: node.id, type: node.type, properties: node.properties }
  }

  const nodeMap = new Map()
  let _id = 0

  document.addEventListener('SvelteInsertEachBlock', e => {
    let node = nodeMap.get(e.detail.block)

    if (node) {
      node._real.push(e.detail.blockCtx)
      nodeMap.set(e.detail.blockCtx, node)
      return
    }

    node = {
      id: _id++,
      type: 'block',
      properties: {
        tagName: 'each',
        ctx: JSON.parse(JSON.stringify(e.detail.block))
      },
      _ctx: null,
      _real: [e.detail.blockCtx]
    }
    nodeMap.set(node.id, node)
    nodeMap.set(e.detail.block, node)
    nodeMap.set(e.detail.blockCtx, node)

    let target = nodeMap.get(e.detail.target)
    if (!target || target._ctx != e.detail.ctx) {
      target = nodeMap.get(e.detail.ctx)
    }

    const anchor = nodeMap.get(e.detail.anchor)
    window.postMessage({
      target: target ? target.id : null,
      anchor: anchor ? anchor.id : null,
      type: 'addNode',
      node: serializeNode(node)
    })
  })

  document.addEventListener('SvelteInsertHTMLElement', e => {
    const node = {
      id: _id++,
      type:
        e.detail.node.nodeType == 1
          ? 'element'
          : e.detail.node.nodeValue
          ? 'text'
          : 'anchor',
      properties: serializeDOM(e.detail.node),
      _ctx: e.detail.ctx,
      _real: e.detail.node
    }
    nodeMap.set(node.id, node)
    nodeMap.set(e.detail.node, node)

    let target = nodeMap.get(e.detail.target)
    if (!target || target._ctx != e.detail.ctx) {
      target = nodeMap.get(e.detail.ctx)
    }

    const anchor = nodeMap.get(e.detail.anchor)
    window.postMessage({
      target: target ? target.id : null,
      anchor: anchor ? anchor.id : null,
      type: 'addNode',
      node: serializeNode(node)
    })
  })

  document.addEventListener('SvelteInsertComponent', e => {
    const node = {
      id: _id++,
      type: 'component',
      properties: serializeComponent(e.detail.component),
      _ctx: e.detail.component.$$.ctx,
      _real: e.detail.component
    }
    nodeMap.set(node.id, node)
    nodeMap.set(e.detail.component.$$.ctx, node)

    let target = nodeMap.get(e.detail.target)
    if (!target || target._ctx != e.detail.ctx) {
      target = nodeMap.get(e.detail.ctx)
    }

    const anchor = nodeMap.get(e.detail.anchor)
    window.postMessage({
      target: target ? target.id : null,
      anchor: anchor ? anchor.id : null,
      type: 'addNode',
      node: serializeNode(node)
    })
  })

  document.addEventListener('SvelteRemoveNode', e => {
    const node = nodeMap.get(e.detail.node)
    nodeMap.delete(e.detail.node)
    window.postMessage({
      type: 'removeNode',
      node: serializeNode(node)
    })
  })

  document.addEventListener('SvelteUpdate', e => {
    const node = nodeMap.get(e.detail.$$.ctx)
    Object.assign(node.properties, serializeInternals(e.detail.$$))
    window.postMessage({
      type: 'updateNode',
      node: serializeNode(node)
    })
  })

  function handleMessage(msg) {
    switch (msg.type) {
      case 'setSelected':
        const node = nodeMap.get(msg.nodeId)
        if (node) (window.wrappedJSObject || window).$s = node._real

        break
    }
  }

  window.postMessage({ type: 'loadInline' })
})()
