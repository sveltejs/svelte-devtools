import { getNode, addNodeListener } from 'svelte-listener'

window.__svelte_devtools_inject_state = function(id, key, value) {
  let component = getNode(id).detail
  component.$inject_state({ [key]: value })
}

window.__svelte_devtools_select_element = function(element) {
  let node = getNode(element)
  if (node) window.postMessage({ type: 'inspect', node: serializeNode(node) })
}

const hoverArea = document.createElement('div')
hoverArea.style.position = 'fixed'
hoverArea.style.backgroundColor = 'rgba(0, 136, 204, 0.2)'
hoverArea.style.zIndex = '2147483647'

const hoverX = document.createElement('div')
hoverX.style.position = 'fixed'
hoverX.style.borderStyle = 'dashed'
hoverX.style.borderColor = 'rgb(0, 136, 204)'
hoverX.style.borderWidth = '1px 0'
hoverX.style.zIndex = '2147483647'
hoverX.style.left = '0'
hoverX.style.width = '100vw'

const hoverY = document.createElement('div')
hoverY.style.position = 'fixed'
hoverY.style.borderStyle = 'dashed'
hoverY.style.borderColor = 'rgb(0, 136, 204)'
hoverY.style.borderWidth = '0 1px'
hoverY.style.zIndex = '2147483647'
hoverY.style.top = '0'
hoverY.style.height = '100vh'

function getBoundingRect(node) {
  if (node.type == 'element') return node.detail.getBoundingClientRect()

  const maxRect = {
    top: Infinity,
    left: Infinity,
    bottom: -Infinity,
    right: -Infinity
  }

  for (const child of node.children) {
    const rect = getBoundingRect(child)
    if (rect.top < maxRect.top) maxRect.top = rect.top
    if (rect.left < maxRect.left) maxRect.left = rect.left
    if (rect.bottom > maxRect.bottom) maxRect.bottom = rect.bottom
    if (rect.right > maxRect.right) maxRect.right = rect.right
  }

  maxRect.width = maxRect.right - maxRect.left
  maxRect.height = maxRect.bottom - maxRect.top

  return maxRect
}

window.addEventListener('message', e => handleMessage(e.data), false)

function handleMessage(msg) {
  const node = getNode(msg.nodeId)

  switch (msg.type) {
    case 'setSelected':
      if (node) window.$s = node.detail
      break

    case 'setHover':
      if (!node) {
        hoverArea.remove()
        hoverX.remove()
        hoverY.remove()
        break
      }

      const box = getBoundingRect(node)
      hoverArea.style.top = box.top + 'px'
      hoverArea.style.left = box.left + 'px'
      hoverArea.style.width = box.width + 'px'
      hoverArea.style.height = box.height + 'px'
      document.body.append(hoverArea)

      hoverX.style.top = box.top + 'px'
      hoverX.style.height = box.height - 2 + 'px'
      document.body.append(hoverX)

      hoverY.style.left = box.left + 'px'
      hoverY.style.width = box.width - 2 + 'px'
      document.body.append(hoverY)

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

    case 'iteration':
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

addNodeListener({
  add(node, anchor) {
    window.postMessage({
      target: node.parent ? node.parent.id : null,
      anchor: anchor ? anchor.id : null,
      type: 'addNode',
      node: serializeNode(node)
    })
  },

  remove(node) {
    window.postMessage({
      type: 'removeNode',
      node: serializeNode(node)
    })
  },

  update(node) {
    window.postMessage({
      type: 'updateNode',
      node: serializeNode(node)
    })
  }
})

window.postMessage({ type: 'loadInline' })
