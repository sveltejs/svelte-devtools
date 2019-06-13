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

  function clone(value, seen = new Map()) {
    if (Array.isArray(value)) return value.map(o => clone(o, seen))
    else if (typeof value == 'function')
      return { __isFunction: true, source: value.toString(), name: value.name }
    else if (typeof value == 'object' && value != null) {
      if (seen.has(value)) return {}

      const o = {}
      seen.set(value, o)

      for (const [key, v] of Object.entries(value)) {
        o[key] = clone(v, seen)
      }

      return o
    } else return value
  }

  function serializeNode(node) {
    const serialized = {
      id: node.id,
      type: node.type,
      tagName: node.tagName
    }
    switch (node.type) {
      case 'component': {
        if (!node.detail.$$) {
          serialized.detail = {}
          break
        }

        const internal = node.detail.$$
        const ctx = clone(internal.ctx)
        serialized.detail = {
          attributes: internal.props.reduce((o, key) => {
            const value = ctx[key]
            if (value === undefined) return o

            delete ctx[key]
            o.push({ key, value, isBound: key in internal.bound })
            return o
          }, []),
          listeners: Object.entries(internal.callbacks).reduce(
            (list, [event, value]) =>
              list.concat(value.map(o => ({ event, handler: o.toString() }))),
            []
          ),
          ctx: Object.entries(ctx).map(([key, value]) => ({ key, value }))
        }
        break
      }

      case 'element': {
        const element = node.detail
        serialized.detail = {
          attributes: Array.from(element.attributes).map(attr => ({
            key: attr.name,
            value: attr.value
          })),
          listeners: element.__listeners
            ? element.__listeners.map(o => ({
                ...o,
                handler: o.handler.toString()
              }))
            : []
        }

        break
      }

      case 'text': {
        serialized.detail = {
          nodeValue: node.detail.nodeValue
        }
        break
      }

      case 'block': {
        const { ctx, source } = node.detail
        serialized.detail = {
          ctx: Object.entries(clone(ctx)).map(([key, value]) => ({
            key,
            value
          })),
          source: source.substring(source.indexOf('{'), source.indexOf('}') + 1)
        }
      }
    }

    return serialized
  }

  const nodeMap = new Map()
  let _id = 0
  let currentBlock

  function addNode(node, target, anchor) {
    nodeMap.set(node.id, node)

    let targetNode = nodeMap.get(target)
    if (!targetNode || targetNode.parentBlock != node.parentBlock) {
      targetNode = node.parentBlock
    }

    const anchorNode = nodeMap.get(anchor)
    window.postMessage({
      target: targetNode ? targetNode.id : null,
      anchor: anchorNode ? anchorNode.id : null,
      type: 'addNode',
      node: serializeNode(node)
    })
  }

  document.addEventListener('SvelteRegisterComponent', e => {
    const { component, tagName } = e.detail

    const node = nodeMap.get(component.$$.fragment)
    if (node) {
      nodeMap.delete(component.$$.fragment)

      node.detail = component
      node.tagName = tagName

      window.postMessage({
        type: 'updateNode',
        node: serializeNode(node)
      })
    } else {
      nodeMap.set(component.$$.fragment, {
        type: 'component',
        detail: component,
        tagName
      })
    }
  })

  // Ugly hack b/c promises are resolved/rejected outside of normal render flow
  let lastPromiseParent = null
  document.addEventListener('SvelteRegisterBlock', e => {
    const { type, id, block, ...detail } = e.detail
    const tagName = type == 'pending' ? 'await' : type
    const nodeId = _id++

    const mountFn = block.m
    const updateFn = block.p
    const detachFn = block.d
    block.m = (target, anchor) => {
      let node = {
        id: nodeId,
        type: 'block',
        detail,
        tagName,
        parentBlock: currentBlock
      }

      switch (type) {
        case 'then':
        case 'catch':
          if (!node.parentBlock) node.parentBlock = lastPromiseParent
          break

        case 'each':
          const eachNode = nodeMap.get(id)
          if (eachNode) node = eachNode
          else nodeMap.set(id, node)
          break

        case 'component':
          const componentNode = nodeMap.get(block)
          if (componentNode) {
            nodeMap.delete(block)
            Object.assign(node, componentNode)
          } else {
            Object.assign(node, {
              type: 'component',
              tagName: 'Unknown',
              detail: {}
            })
            nodeMap.set(block, node)
          }

          Promise.resolve().then(() => {
            if (node.detail.$$ && !Object.keys(node.detail.$$.bound).length)
              return

            window.postMessage({
              type: 'updateNode',
              node: serializeNode(node)
            })
          })
          break
      }

      if (node.id == nodeId) addNode(node, target, anchor)

      currentBlock = node

      mountFn(target, anchor)

      currentBlock = currentBlock.parentBlock
    }

    block.p = (changed, ctx) => {
      const parentBlock = currentBlock
      currentBlock = nodeMap.get(nodeId)

      window.postMessage({
        type: 'updateNode',
        node: serializeNode(currentBlock)
      })

      updateFn(changed, ctx)

      currentBlock = parentBlock
    }

    block.d = detaching => {
      const node = nodeMap.get(nodeId)

      if (node) {
        if (node.tagName == 'await') lastPromiseParent = node.parentBlock

        nodeMap.delete(node.id)
        nodeMap.delete(id)
        window.postMessage({
          type: 'removeNode',
          node: serializeNode(node)
        })
      }

      detachFn(detaching)
    }
  })

  function insert(element, target, anchor) {
    const node = {
      id: _id++,
      type:
        element.nodeType == 1
          ? 'element'
          : element.nodeValue && element.nodeValue != ' '
          ? 'text'
          : 'anchor',
      detail: element,
      tagName: element.nodeName.toLowerCase(),
      parentBlock: currentBlock
    }
    nodeMap.set(element, node)
    addNode(node, target, anchor)

    for (const child of element.childNodes) {
      if (!nodeMap.has(child)) insert(child, element)
    }
  }

  document.addEventListener('SvelteDOMInsert', e => {
    const { node: element, target, anchor } = e.detail

    insert(element, target, anchor)
  })

  document.addEventListener('SvelteDOMRemove', e => {
    const { node: child } = e.detail
    const node = nodeMap.get(child)
    if (!node) return

    nodeMap.delete(node.id)
    nodeMap.delete(child)
    window.postMessage({
      type: 'removeNode',
      node: serializeNode(node)
    })
  })

  document.addEventListener('SvelteDOMAddEventListener', e => {
    const { node, ...detail } = e.detail

    if (!node.__listeners) node.__listeners = []

    node.__listeners.push(detail)
  })

  document.addEventListener('SvelteDOMRemoveEventListener', e => {
    const { node, event, handler, modifiers } = e.detail

    if (!node.__listeners) return

    const index = node.__listeners.findIndex(
      o => o.event == event && o.handler == handler && o.modifiers == modifiers
    )

    if (index == -1) return

    node.__listeners.splice(index, 1)
  })

  function updateElement(element) {
    const node = nodeMap.get(element)
    if (!node) return

    if (node.type == 'anchor') node.type = 'text'

    window.postMessage({
      type: 'updateNode',
      node: serializeNode(node)
    })
  }

  document.addEventListener('SvelteDOMSetData', e =>
    updateElement(e.detail.node)
  )
  document.addEventListener('SvelteDOMSetProperty', e =>
    updateElement(e.detail.node)
  )
  document.addEventListener('SvelteDOMSetAttribute', e =>
    updateElement(e.detail.node)
  )
  document.addEventListener('SvelteDOMRemoveAttribute', e =>
    updateElement(e.detail.node)
  )

  window.postMessage({ type: 'loadInline' })
})()
