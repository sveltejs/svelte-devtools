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

port.onMessage.addListener(msg => {
  switch (msg.type) {
    case 'init': {
      selectedNode.set({})
      hoveredNodeId.set(null)
      rootNodes.set([])

      break
    }

    case 'addNode': {
      msg.node.children = []
      msg.node.collapsed = true

      const targetNode = nodeMap.get(msg.target)
      nodeMap.set(msg.node.id, msg.node)
      if (!targetNode) {
        rootNodes.update(o => (o.push(msg.node), o))
        return
      }

      msg.node.parent = targetNode

      let index = -1
      if (msg.anchor) {
        index = targetNode.children.findIndex(o => o.id == msg.anchor)
      }

      if (index != -1) {
        targetNode.children.splice(index, 0, msg.node)
      } else {
        targetNode.children.push(msg.node)
      }

      break
    }

    case 'removeNode': {
      const node = nodeMap.get(msg.node.id)
      const index = node.parent.children.findIndex(o => o.id == node.id)
      node.parent.children.splice(index, 1)
      nodeMap.delete(node.id)

      break
    }

    case 'updateNode': {
      const node = nodeMap.get(msg.node.id)
      Object.assign(node, msg.node)

      const selected = get(selectedNode)
      if (selected && selected.id == msg.node.id) selectedNode.update(o => o)

      break
    }

    case 'inspect': {
      let node = nodeMap.get(msg.node.id)
      selectedNode.set(node)
      while ((node = node.parent)) node.collapsed = false
      break
    }
  }
  rootNodes.update(o => o)
})
