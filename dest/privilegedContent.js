;(function() {
  window.__svelte_devtools_unsafe_set = function(id, key, value) {
    let component = nodeMap.get(id).detail
    component.$unsafe_set({ [key]: value })
  }

  window.__svelte_devtools_select_element = function(element) {
    let node = nodeMap.get(element)
    if (node) window.postMessage({ type: 'inspect', node: serializeNode(node) })
  }

  window.addEventListener('message', e => handleMessage(e.data), false)

  function handleMessage(msg) {
    switch (msg.type) {
      case 'setSelected':
        const node = nodeMap.get(msg.nodeId)
        if (node) window.$s = node.detail

        break
    }
  }

  function serializeNode(node) {
    const serialized = {
      id: node.id,
      type: node.type,
      tagName: node.tagName
    }
    switch (node.type) {
      case 'component':
        const ctx = JSON.parse(JSON.stringify(node.detail.$$.ctx))
        serialized.detail = {
          attributes: node.detail.$$.props.reduce((o, key) => {
            const value = ctx[key]
            if (value === undefined) return o

            delete ctx[key]
            o.push({ key, value, isBound: key in node.detail.$$.bound })
            return o
          }, []),
          ctx: Object.entries(ctx).map(([key, value]) => ({ key, value }))
        }
        break
      case 'element':
        serialized.detail = {
          attributes: Array.from(node.detail.attributes).map(attr => ({
            key: attr.name,
            value: attr.value
          }))
        }

        break
      case 'text':
        serialized.detail = {
          nodeValue: node.detail.nodeValue
        }
        break
      case 'block':
        serialized.detail = {
          ctx: Object.entries(JSON.parse(JSON.stringify(node.detail.ctx))).map(
            ([key, value]) => ({ key, value })
          ),
          source: node.detail.source
        }
    }
    return serialized
  }

  const nodeMap = new Map()
  let _id = 0
  let currentComponent

  function addNode(node, target, anchor) {
    nodeMap.set(node.id, node)
    nodeMap.set(node.detail, node)

    let targetNode = nodeMap.get(target)
    if (!targetNode || targetNode.parentComponent != node.parentComponent) {
      targetNode = node.parentComponent
    }

    const anchorNode = nodeMap.get(anchor)
    window.postMessage({
      target: targetNode ? targetNode.id : null,
      anchor: anchorNode ? anchorNode.id : null,
      type: 'addNode',
      node: serializeNode(node)
    })
  }

  function onElementAdded(element, target, anchor) {
    instrumentElement(element)

    addNode(
      {
        id: _id++,
        type:
          element.nodeType == 1
            ? 'element'
            : element.nodeValue && element.nodeValue != ' '
            ? 'text'
            : 'anchor',
        detail: element,
        tagName: element.nodeName.toLowerCase(),
        parentComponent: currentComponent
      },
      target,
      anchor
    )

    for (const child of element.childNodes) {
      if (!nodeMap.has(child)) onElementAdded(child, element)
    }
  }

  function appendChild(child) {
    onElementAdded(child, this)
    this._appendChild(child)
  }

  function insertBefore(child, reference) {
    onElementAdded(child, this, reference)
    this._insertBefore(child, reference)
  }

  function removeChild(child) {
    const node = nodeMap.get(child)
    nodeMap.delete(node.id)
    nodeMap.delete(node)
    window.postMessage({
      type: 'removeNode',
      node: serializeNode(node)
    })
    this._removeChild(child)
  }

  const observer = new MutationObserver(list =>
    list.forEach(mutation => {
      const node = nodeMap.get(mutation.target)
      if (node)
        window.postMessage({
          type: 'updateNode',
          node: serializeNode(node)
        })
    })
  )

  function instrumentElement(element) {
    if (!element._appendChild) {
      element._appendChild = element.appendChild
      element.appendChild = appendChild
    }

    if (!element._insertBefore) {
      element._insertBefore = element.insertBefore
      element.insertBefore = insertBefore
    }

    if (!element._removeChild) {
      element._removeChild = element.removeChild
      element.removeChild = removeChild
    }

    observer.observe(element, { characterData: true })
  }

  document.addEventListener('SvelteRegisterComponent', e => {
    Promise.resolve().then(() => {
      if (!Object.keys(e.detail.component.$$.bound).length) return

      window.postMessage({
        type: 'updateNode',
        node: serializeNode(nodeMap.get(e.detail.component))
      })
    })

    const mountFn = e.detail.component.$$.fragment.m
    const patchFn = e.detail.component.$$.fragment.p
    const detachFn = e.detail.component.$$.fragment.d
    e.detail.component.$$.fragment.m = (target, anchor) => {
      const node = {
        id: _id++,
        type: 'component',
        detail: e.detail.component,
        tagName: e.detail.tagName,
        parentComponent: currentComponent
      }
      addNode(node, target, anchor)
      currentComponent = node
      instrumentElement(target)

      mountFn(target, anchor)

      currentComponent = currentComponent.parentComponent
    }

    e.detail.component.$$.fragment.p = (changed, ctx) => {
      const parentComponent = currentComponent
      currentComponent = nodeMap.get(e.detail.component)

      window.postMessage({
        type: 'updateNode',
        node: serializeNode(currentComponent)
      })

      patchFn(changed, ctx)
      currentComponent = parentComponent
    }

    e.detail.component.$$.fragment.d = detaching => {
      const node = nodeMap.get(e.detail.component)
      nodeMap.delete(node.id)
      nodeMap.delete(e.detail.component)
      window.postMessage({
        type: 'removeNode',
        node: serializeNode(node)
      })
      detachFn(detaching)
    }
  })

  let lastPromiseParent = null
  document.addEventListener('SvelteRegisterBlock', e => {
    const mountFn = e.detail.block.m
    const patchFn = e.detail.block.p
    const detachFn = e.detail.block.d
    const blockId = e.detail.blockId
    e.detail.block.m = (target, anchor) => {
      const tagName = blockId.substring(0, blockId.indexOf('_'))
      let node = nodeMap.get(blockId)
      if (!node) {
        node = {
          id: _id++,
          type: 'block',
          detail: {
            ctx: e.detail.ctx,
            source: e.detail.source
          },
          tagName: tagName == 'pending' ? 'await' : tagName,
          parentComponent:
            tagName == 'then' || tagName == 'catch'
              ? currentComponent || lastPromiseParent
              : currentComponent
        }
        nodeMap.set(blockId, node)
        addNode(node, target, anchor)
      }
      currentComponent = node

      mountFn(target, anchor)
      currentComponent = currentComponent.parentComponent
    }

    e.detail.block.p = (changed, ctx) => {
      const parentComponent = currentComponent
      currentComponent = nodeMap.get(blockId)

      window.postMessage({
        type: 'updateNode',
        node: serializeNode(currentComponent)
      })

      patchFn(changed, ctx)
      currentComponent = parentComponent
    }

    e.detail.block.d = detaching => {
      const node = nodeMap.get(blockId)
      if (node.tagName == 'await') lastPromiseParent = node.parentComponent

      nodeMap.delete(node.id)
      nodeMap.delete(node.detail)
      nodeMap.delete(blockId)
      window.postMessage({
        type: 'removeNode',
        node: serializeNode(node)
      })
      detachFn(detaching)
    }
  })

  window.postMessage({ type: 'loadInline' })
})()
