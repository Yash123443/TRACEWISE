import { OperationProposalSchema, type OperationProposal } from '../contracts/index.js'
import type { ReplaySetup } from './rules.js'

export interface AiInterpretSuccess { ok: true; proposal: OperationProposal; model: string; promptVersion: string }
export interface AiInterpretFailure { ok: false; reason: string }
export type AiInterpreter = (input: { answerText: string; setup: ReplaySetup }) => Promise<AiInterpretSuccess | AiInterpretFailure>
export function createAiInterpreter({ endpoint = '/api/ai/interpret', fetchFn = fetch, timeoutMs = 25000 }: { endpoint?: string; fetchFn?: typeof fetch; timeoutMs?: number } = {}): AiInterpreter {
  return async ({ answerText, setup }) => {
    const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), timeoutMs)
    try {
      const response = await fetchFn(endpoint, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ answerText, newNode: setup.newNode, listNodes: setup.initial.list, headAliases: setup.headAliases, newNodeAliases: setup.newNodeAliases }), signal: controller.signal })
      if (!response.ok) { const reason = response.status === 503 ? 'AI is not configured' : response.status === 429 ? 'AI rate limit reached' : 'AI interpretation was unavailable'; return { ok: false, reason } }
      const json: unknown = await response.json(); const parsed = OperationProposalSchema.safeParse((json as { proposal?: unknown }).proposal)
      if (!parsed.success) return { ok: false, reason: 'AI returned an invalid operation proposal' }
      if (parsed.data.operations.some((op) => !answerText.includes(op.source_text))) return { ok: false, reason: "AI source text did not match the student's words" }
      const operations = [...parsed.data.operations]
      if (!operations.some((op) => op.op === 'capture' && op.name === 'old_head') && operations.some((op) => op.op === 'set_next' && op.target === '$old_head')) operations.unshift({ op: 'capture', name: 'old_head', from: 'head', source_text: 'implicit capture of the head before any change' })
      if (!operations.some((op) => op.op === 'allocate' && op.node === setup.newNode)) operations.unshift({ op: 'allocate', node: setup.newNode, source_text: 'implicit: node already allocated' })
      return { ok: true, proposal: { ...parsed.data, operations }, model: typeof (json as { model?: unknown }).model === 'string' ? (json as { model: string }).model : 'unknown', promptVersion: typeof (json as { promptVersion?: unknown }).promptVersion === 'string' ? (json as { promptVersion: string }).promptVersion : 'unknown' }
    } catch (error) { return { ok: false, reason: error instanceof DOMException && error.name === 'AbortError' ? 'AI request timed out' : 'AI interpretation was unavailable' }; } finally { clearTimeout(timer) }
  }
}
