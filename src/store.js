import { writable, get } from 'svelte/store'

export const visibility = writable({
  component: true,
  element: true,
  block: true,
  text: true,
  anchor: false
})
export const selectedNode = writable({})
export const hoveredNodeId = writable(null)
export const rootNodes = writable([])
const nodeMap = new Map()

const port = chrome.runtime.connect()
port.postMessage({
  type: 'init',
  tabId: chrome.devtools.inspectedWindow.tabId
})

selectedNode.subscribe(node =>
  port.postMessage({
    type: 'setSelected',
    tabId: chrome.devtools.inspectedWindow.tabId,
    nodeId: node.id
  })
)

function noop() {}

function insertNode(node, target, anchorId) {
  node.parent = target

  let index = -1
  if (anchorId) index = target.children.findIndex(o => o.id == anchorId)

  if (index != -1) {
    target.children.splice(index, 0, node)
  } else {
    target.children.push(node)
  }

  target.invalidate()
}

port.onMessage.addListener(msg => {
  switch (msg.type) {
    case 'init': {
      selectedNode.set({})
      hoveredNodeId.set(null)
      rootNodes.set([])

      break
    }

    case 'addNode': {
      const node = msg.node
      node.children = []
      node.collapsed = true
      node.invalidate = noop

      const targetNode = nodeMap.get(msg.target)
      nodeMap.set(node.id, node)

      if (targetNode) {
        insertNode(node, targetNode, msg.anchor)
        return
      }

      if (node._timeout) return

      node._timeout = setTimeout(() => {
        delete node._timeout
        const targetNode = nodeMap.get(msg.target)
        if (targetNode) insertNode(node, targetNode, msg.anchor)
        else rootNodes.update(o => (o.push(node), o))
      }, 100)

      break
    }

    case 'removeNode': {
      const node = nodeMap.get(msg.node.id)
      const index = node.parent.children.findIndex(o => o.id == node.id)
      node.parent.children.splice(index, 1)
      nodeMap.delete(node.id)

      node.parent.invalidate()

      break
    }

    case 'updateNode': {
      const node = nodeMap.get(msg.node.id)
      Object.assign(node, msg.node)

      const selected = get(selectedNode)
      if (selected && selected.id == msg.node.id) selectedNode.update(o => o)

      node.invalidate()

      break
    }

    case 'inspect': {
      let node = nodeMap.get(msg.node.id)
      selectedNode.set(node)
      while (node.parent) {
        node = node.parent
        node.collapsed = false
      }

      node.invalidate()

      break
    }
  }
})
