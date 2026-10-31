import { describe, expect, it, vi } from 'vitest'
import { createAiAnswerEvaluator, createAiInterpreter } from './ai.js'
import { createHybridEvaluator } from './hybrid.js'
import { replaySetup } from './rules.js'
import { questions } from '../data/questions.js'

const setup = replaySetup.diag_linked_lists_head_insert
const proposal = { status: 'identified', operations: [{ op: 'set_next', node: 'N', target: 'head', source_text: 'point N to head' }, { op: 'set_head', target: 'N', source_text: 'make N the head' }], clarification_question: null } as const
const response = (json: unknown, status = 200) => new Response(JSON.stringify(json), { status })
const answerEvaluation = { status: 'correct' as const, concept_id: 'arrays', misconception_code: null, evidence: ['int *a'], confidence_band: 'high' as const, explanation: 'You explained the array parameter adjustment.', corrective_explanation: '', follow_up_question_id: null, clarification_question: null, source: 'llm' as const }
describe('AI interpreter and hybrid evaluator', () => {
  it('accepts matching operations and rejects unmatched source text', async () => { const good = createAiInterpreter({ fetchFn: vi.fn(async () => response({ proposal, model: 'mock', promptVersion: 'v' })) as typeof fetch }); expect((await good({ answerText: 'point N to head then make N the head', setup })).ok).toBe(true); const bad = createAiInterpreter({ fetchFn: vi.fn(async () => response({ proposal: { ...proposal, operations: [{ ...proposal.operations[0], source_text: 'invented' }] } })) as typeof fetch }); expect((await bad({ answerText: 'point N to head', setup })).ok).toBe(false) })
  it('adds each implicit setup operation once and accepts existing captures', async () => { const oldHead = { status: 'identified' as const, operations: [{ op: 'capture' as const, name: 'old_head', from: 'head', source_text: 'point N to the old head' }, { op: 'set_next' as const, node: 'N', target: '$old_head', source_text: 'point N to the old head' }, { op: 'set_head' as const, target: 'N', source_text: 'make N the head' }], clarification_question: null }; const interpreter = createAiInterpreter({ fetchFn: vi.fn(async () => response({ proposal: oldHead })) as typeof fetch }); const result = await interpreter({ answerText: 'point N to the old head then make N the head', setup }); expect(result.ok && result.proposal.operations.filter((op) => op.op === 'allocate')).toHaveLength(1); expect(result.ok && result.proposal.operations.filter((op) => op.op === 'capture' && op.name === 'old_head')).toHaveLength(1) })
  it('handles network and HTTP failures', async () => { expect((await createAiInterpreter({ fetchFn: vi.fn(async () => { throw new Error('nope') }) as typeof fetch })({ answerText: 'x', setup })).ok).toBe(false); expect((await createAiInterpreter({ fetchFn: vi.fn(async () => response({}, 500)) as typeof fetch })({ answerText: 'x', setup })).ok).toBe(false) })
  it('calls Gemini for free-text explain and trace questions and keeps MCQ deterministic', async () => {
    const interpreter = vi.fn(async () => ({ ok: true as const, proposal, model: 'mock', promptVersion: 'v' }))
    const answerEvaluator = vi.fn(async () => ({ ok: true as const, evaluation: answerEvaluation }))
    const hybrid = createHybridEvaluator({ interpreter, answerEvaluator })
    const explanation = await hybrid(questions.find((q) => q.id === 'arrays_function_parameter')!, 'In a function parameter int a[] becomes int *a, so sizeof measures a pointer.')
    expect(explanation.evaluation.source).toBe('llm'); expect(answerEvaluator).toHaveBeenCalledTimes(1)
    const trace = await hybrid(questions.find((q) => q.id === 'arrays_sum_loop')!, 'The loop adds 2 + 4 + 6, so it prints 12.')
    expect(trace.evaluation.source).toBe('llm'); expect(answerEvaluator).toHaveBeenCalledTimes(2)
    const mcq = await hybrid(questions.find((q) => q.id === 'diag_arrays_bounds')!, '4')
    expect(mcq.evaluation.source).toBe('rule'); expect(answerEvaluator).toHaveBeenCalledTimes(2)
    const replay = await hybrid(questions.find((q) => q.id === 'diag_linked_lists_head_insert')!, 'point N to head then make N the head')
    expect(replay.evaluation).toMatchObject({ status: 'correct', source: 'llm' }); expect(interpreter).toHaveBeenCalledTimes(1)
  })
  it('validates AI explanation responses and removes evidence not quoted from the answer', async () => {
    const question = questions.find((q) => q.id === 'arrays_function_parameter')!
    const fetchFn = vi.fn(async () => response({ evaluation: { ...answerEvaluation, evidence: ['int *a', 'invented quote'] } }))
    const evaluator = createAiAnswerEvaluator({ fetchFn: fetchFn as typeof fetch })
    const result = await evaluator({ question, answerText: 'In a function parameter int a[] becomes int *a.' })
    expect(result).toMatchObject({ ok: true, evaluation: { source: 'llm', evidence: ['int *a'] } })
    expect(JSON.parse(String(fetchFn.mock.calls[0][1]?.body))).toMatchObject({ task: 'answer_evaluation', questionId: question.id, conceptId: 'arrays' })
  })
  it('falls back to rules when free-text AI assessment is unavailable', async () => {
    const hybrid = createHybridEvaluator({ interpreter: async () => ({ ok: false, reason: 'offline' }), answerEvaluator: async () => ({ ok: false, reason: 'offline' }) })
    const result = await hybrid(questions.find((q) => q.id === 'arrays_function_parameter')!, String(questions.find((q) => q.id === 'arrays_function_parameter')!.answerKey))
    expect(result.evaluation.source).toBe('rule'); expect(result.evaluation.explanation).toContain('AI assessment was unavailable')
  })
  it('reports simulator self-loops and falls back to rules', async () => { const loop = { ...proposal, operations: [{ op: 'set_head' as const, target: 'N', source_text: 'make N the head' }, { op: 'set_next' as const, node: 'N', target: 'head', source_text: 'point N to head' }] }; const hybrid = createHybridEvaluator({ interpreter: async () => ({ ok: true, proposal: loop, model: 'mock', promptVersion: 'v' }), answerEvaluator: async () => ({ ok: false, reason: 'offline' }) }); expect((await hybrid(questions.find((q) => q.id === 'diag_linked_lists_head_insert')!, 'make N the head then point N to head')).evaluation.misconception_code).toBe('LL_SELF_LOOP'); const fallback = createHybridEvaluator({ interpreter: async () => ({ ok: false, reason: 'offline' }), answerEvaluator: async () => ({ ok: false, reason: 'offline' }) }); expect((await fallback(questions.find((q) => q.id === 'diag_linked_lists_head_insert')!, 'point N to head then make N the head')).evaluation.explanation).toContain('AI interpretation was unavailable') })
})
