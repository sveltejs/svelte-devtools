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
    attributes: $$.props.map(name => ({ name, value: ctx[name] })),
    ctx
  }
}

const port = browser.runtime.connect()
function serializeNode(node) {
  return { id: node.id, type: node.type, properties: node.properties }
}

const nodeMap = new Map()
let _id = 0

document.addEventListener('SvelteInsertEachBlock', e => {
  const node = {
    id: _id++,
    type: 'block',
    properties: {
      tagName: 'each',
      ctx: JSON.parse(JSON.stringify(e.detail.block))
    },
    _ctx: e.detail.block,
    _real: e.detail.block
  }
  nodeMap.set(node.id, node)
  nodeMap.set(e.detail.block, node)

  let target = nodeMap.get(e.detail.target)
  if (!target || target._ctx != e.detail.ctx) {
    target = nodeMap.get(e.detail.ctx)
  }

  const anchor = nodeMap.get(e.detail.anchor)
  port.postMessage({
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
  port.postMessage({
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
  port.postMessage({
    target: target ? target.id : null,
    anchor: anchor ? anchor.id : null,
    type: 'addNode',
    node: serializeNode(node)
  })
})

document.addEventListener('SvelteRemoveNode', e => {
  const node = nodeMap.get(e.detail.node)
  nodeMap.delete(e.detail.node)
  port.postMessage({
    type: 'removeNode',
    node: serializeNode(node)
  })
})

document.addEventListener('SvelteUpdate', e => {
  const node = nodeMap.get(e.detail.$$.ctx)
  Object.assign(node.properties, serializeInternals(e.detail.$$))
  port.postMessage({
    type: 'updateNode',
    node: serializeNode(node)
  })
})

exportFunction(
  (id, key, value) => {
    const component = nodeMap.get(id)._real.wrappedJSObject
    component.$$.ctx[key] = value
    window.wrappedJSObject.make_dirty(component, key)
  },
  window,
  {
    defineAs: 'setSvelteState'
  }
)

null
