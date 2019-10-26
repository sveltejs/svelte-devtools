import {
  getNode,
  addNodeListener,
  startProfiler,
  stopProfiler
} from 'svelte-listener'
import { highlight, startPicker, stopPicker } from './highlight.js'

window.__svelte_devtools_inject_state = function(id, key, value) {
  let component = getNode(id).detail
  component.$inject_state({ [key]: value })
}

window.__svelte_devtools_select_element = function(element) {
  let node = getNode(element)
  if (node) window.postMessage({ type: 'inspect', node: serializeNode(node) })
}

window.addEventListener('message', e => handleMessage(e.data), false)

function handleMessage(msg) {
  const node = getNode(msg.nodeId)

  switch (msg.type) {
    case 'setSelected':
      if (node) window.$s = node.detail
      break

    case 'setHover':
      highlight(node)
      break

    case 'startPicker':
      startPicker()
      break

    case 'stopPicker':
      stopPicker()
      break

    case 'startProfiler':
      startProfiler()
      break

    case 'stopProfiler':
      stopProfiler()
      break
  }
}

function clone(value, seen = new Map()) {
  switch (typeof value) {
    case 'function':
      return { __isFunction: true, source: value.toString(), name: value.name }
    case 'symbol':
      return { __isSymbol: true, name: value.toString() }
    case 'object':
      if (value === window || value === null) return null
      if (Array.isArray(value)) return value.map(o => clone(o, seen))
      if (seen.has(value)) return {}

      const o = {}
      seen.set(value, o)

      for (const [key, v] of Object.entries(value)) {
        o[key] = clone(v, seen)
      }

      return o
    default:
      return value
  }
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
  },

  profile(frame) {
    window.postMessage({
      type: 'updateProfile',
      frame
    })
  }
})
