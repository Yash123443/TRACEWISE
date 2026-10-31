import type { Operation } from '../contracts/index.js'

export function correctInsertAtHead(newNode = 'N'): Operation[] {
  return [
    { op: 'allocate', node: newNode, source_text: `allocate ${newNode}` },
    { op: 'set_next', node: newNode, target: 'head', source_text: `${newNode}.next = head` },
    { op: 'set_head', target: newNode, source_text: `head = ${newNode}` },
  ]
}

export function correctInsertAtHeadWithCapture(newNode = 'N'): Operation[] {
  return [
    { op: 'allocate', node: newNode, source_text: `allocate ${newNode}` },
    { op: 'capture', name: 'old_head', from: 'head', source_text: 'save old_head from head' },
    { op: 'set_head', target: newNode, source_text: `head = ${newNode}` },
    { op: 'set_next', node: newNode, target: '$old_head', source_text: `${newNode}.next = old_head` },
  ]
}
