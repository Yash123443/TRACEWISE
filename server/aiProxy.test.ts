import { describe, expect, it, vi } from 'vitest'
import { createInterpretHandler } from './aiProxy.js'

const body = { answerText: 'set N next to head', newNode: 'N', listNodes: ['A'], headAliases: ['head'], newNodeAliases: ['N'] }
const gemini = (text: string, status = 200) => new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text }] } }] }), { status })
describe('Gemini interpretation proxy', () => {
  it('returns 503 without a key and 400 for invalid input', async () => { expect((await createInterpretHandler({ env: {} })(body)).status).toBe(503); expect((await createInterpretHandler({ env: { GEMINI_API_KEY: 'x' } })({})).status).toBe(400) })
  it('does not expose keys and maps upstream errors', async () => { const handler = createInterpretHandler({ env: { GEMINI_API_KEY: 'secret' }, fetchFn: vi.fn(async () => gemini('', 429)) as typeof fetch }); const result = await handler(body); expect(result).toEqual({ status: 429, json: { error: 'AI_RATE_LIMIT' } }); expect(JSON.stringify(result)).not.toContain('secret') })
  it('validates model JSON and sends the key only in the header', async () => { let url = ''; let init: RequestInit | undefined; const fetchFn: typeof fetch = async (input, request) => { url = String(input); init = request; return gemini(JSON.stringify({ status: 'identified', operations: [{ op: 'set_next', node: 'N', target: 'head', source_text: 'set N next to head' }], clarification_question: null })) }; const result = await createInterpretHandler({ env: { GEMINI_API_KEY: 'secret' }, fetchFn })(body); expect(result.status).toBe(200); expect(url).not.toContain('secret'); expect((init?.headers as Record<string, string>)['x-goog-api-key']).toBe('secret') })
})
