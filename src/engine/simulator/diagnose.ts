import type { Trace } from '../contracts/index.js'

export interface TraceDiagnosis { code: string | null; explanation: string }

export function diagnoseTrace(trace: Trace, newNode = 'N'): TraceDiagnosis {
  if (trace.error) return { code: null, explanation: 'The steps could not be simulated, so clarification is needed.' }
  const original = trace.steps[0]?.unreachable.filter((node) => node !== newNode) ?? []
  const originals = original.length > 0 ? original : ['A', 'B', 'C']
  if (trace.final_list.length === originals.length + 1 && trace.final_list[0] === newNode && originals.every((node, index) => trace.final_list[index + 1] === node)) {
    return { code: null, explanation: 'The simulated outcome is correct.' }
  }
  const lastNodes = trace.steps.at(-1)?.nodes
  if (lastNodes?.[newNode]?.next === newNode) return { code: 'LL_SELF_LOOP', explanation: `${newNode}.next points back to ${newNode}, creating a self-loop.` }
  if (trace.final_head === (originals[0] ?? 'A')) return { code: 'LL_FORGOT_HEAD_UPDATE', explanation: `Head still points to the original first node ${trace.final_head}.` }
  if (trace.final_head === newNode && originals.some((node) => trace.unreachable_nodes.includes(node))) return { code: 'LL_INSERT_ORDER', explanation: `Head points to ${newNode}, but one or more original nodes are unreachable.` }
  return { code: null, explanation: 'The simulated outcome is unusual and needs clarification.' }
}
