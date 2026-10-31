import type { Operation, Trace, TraceFrame } from '../contracts/index.js'

export interface ReplayInitialState { head: string | null; list: string[] }
type NodeState = Record<string, { next: string | null }>

const reachableFrom = (nodes: NodeState, head: string | null): string[] => {
  const reachable: string[] = []
  const seen = new Set<string>()
  let current = head
  while (current !== null && nodes[current] && !seen.has(current)) {
    reachable.push(current)
    seen.add(current)
    current = nodes[current].next
  }
  return reachable
}

const copyNodes = (nodes: NodeState): NodeState => Object.fromEntries(Object.entries(nodes).map(([name, node]) => [name, { next: node.next }]))

export function runReplay(operations: Operation[], initial: ReplayInitialState = { head: 'A', list: ['A', 'B', 'C'] }): Trace {
  const nodes: NodeState = {}
  for (let index = 0; index < initial.list.length; index++) {
    const name = initial.list[index]
    if (nodes[name]) return { steps: [], final_head: initial.head, final_list: [], unreachable_nodes: [...initial.list], error: `Initial list contains duplicate node ${name}.` }
    nodes[name] = { next: initial.list[index + 1] ?? null }
  }
  let head = initial.head
  const captures = new Map<string, string | null>()
  const steps: TraceFrame[] = []
  let error: string | undefined

  const resolveTarget = (target: string): string | null => {
    if (target === 'head') return head
    if (target === 'null') return null
    if (target.startsWith('$')) {
      const name = target.slice(1)
      if (!captures.has(name)) throw new Error(`Capture ${name || '(empty)'} has not been saved.`)
      return captures.get(name) ?? null
    }
    if (!nodes[target]) throw new Error(`Node ${target} does not exist.`)
    return target
  }

  if (operations.length === 0) error = 'No operations were provided to simulate.'

  for (let index = 0; index < operations.length && !error; index++) {
    const operation = operations[index]
    try {
      let note: string
      switch (operation.op) {
        case 'allocate':
          if (nodes[operation.node]) throw new Error(`Node ${operation.node} already exists.`)
          nodes[operation.node] = { next: null }
          note = `Allocated ${operation.node} with next set to null.`
          break
        case 'capture':
          if (captures.has(operation.name)) throw new Error(`Capture ${operation.name} already exists.`)
          captures.set(operation.name, resolveTarget(operation.from))
          note = `Saved the current value of ${operation.from} as $${operation.name}.`
          break
        case 'set_next':
          if (!nodes[operation.node]) throw new Error(`Node ${operation.node} does not exist.`)
          nodes[operation.node].next = resolveTarget(operation.target)
          note = `${operation.node}.next now points to ${nodes[operation.node].next ?? 'null'}${operation.target === 'head' ? ', which is the head right now' : ''}.`
          break
        case 'set_head':
          head = resolveTarget(operation.target)
          note = `Head now points to ${head ?? 'null'}.`
          break
      }
      const reachable = reachableFrom(nodes, head)
      steps.push({ index, operation, nodes: copyNodes(nodes), head, reachable, unreachable: Object.keys(nodes).filter((name) => !reachable.includes(name)), note })
    } catch (cause) {
      error = cause instanceof Error ? cause.message : 'The operation could not be simulated.'
    }
  }

  const finalList = reachableFrom(nodes, head)
  const cycle = head !== null && (() => {
    let current: string | null = head
    const seen = new Set<string>()
    while (current !== null && nodes[current]) {
      if (seen.has(current)) return true
      seen.add(current)
      current = nodes[current].next
    }
    return false
  })()
  if (cycle && steps.length > 0) steps[steps.length - 1].note += ' A cycle is present; traversal stops when a node repeats.'
  return { steps, final_head: head, final_list: finalList, unreachable_nodes: Object.keys(nodes).filter((name) => !finalList.includes(name)), ...(error ? { error } : {}) }
}
