import { describe, expect, it } from 'vitest'
import { createTracewiseService, MemoryStorage, ServiceError } from './index.js'

const now = new Date('2026-10-31T10:00:00.000Z')
const make = (storage = new MemoryStorage()) => createTracewiseService({ storage, clock: () => now })
const submit = (service: ReturnType<typeof make>, questionId: string, answerText: string, idempotencyKey: string, inputMode: 'typed' | 'dictated' = 'typed') => service.submitAnswer({ learnerId: 'learner', questionId, answerText, inputMode, idempotencyKey, now })

describe('Tracewise service integration', () => {
  it('a new learner starts with every concept not assessed', async () => {
    const concepts = await make().getConcepts('learner')
    expect(concepts).toHaveLength(10)
    expect(concepts.every(({ mastery }) => mastery.status === 'not_assessed' && mastery.mastery === null && mastery.attempts === 0)).toBe(true)
  })

  it('records six diagnostic answers without assessing unrelated concepts', async () => {
    const service = make()
    await submit(service, 'diag_arrays_bounds', '4', 'd1')
    await submit(service, 'diag_pointers_address', 'the address of x', 'd2')
    await submit(service, 'diag_structures_member', 'q->x', 'd3')
    await submit(service, 'diag_linked_lists_head_insert', 'Set N next to the old head then set head to N', 'd4')
    await submit(service, 'diag_stacks_order', '1', 'd5')
    await submit(service, 'diag_queues_order', 'A', 'd6')
    const status = await service.getDiagnosticStatus('learner')
    expect(status).toMatchObject({ total: 6, answered: 6, complete: true })
    expect((await service.getHistory('learner')).every((entry) => entry.reason.length > 0)).toBe(true)
    const states = Object.fromEntries((await service.getConcepts('learner')).map(({ concept, mastery }) => [concept.id, mastery]))
    for (const id of ['trees', 'graphs', 'searching_sorting', 'dynamic_memory']) expect(states[id].status).toBe('not_assessed')
  })

  it('creates a due review and recommendation after a wrong answer', async () => {
    const result = await submit(make(), 'diag_arrays_bounds', '5', 'wrong')
    expect(result.nextRecommendation?.reason).not.toBe('')
    expect(result.nextRecommendation?.difficulty).toBeTruthy()
    expect(result.revisionTask).toMatchObject({ status: 'due' })
    expect(result.revisionTask?.dueDate).toBe(now.toISOString())
  })

  it('advances the demo clock for scheduled reviews', async () => {
    const service = make()
    await submit(service, 'diag_pointers_address', '7', 'right')
    await service.advanceDemoTime(3)
    expect((await service.getRevisionQueue('learner', new Date('2026-11-03T10:00:00.000Z'))).due).toHaveLength(1)
  })

  it('is idempotent for the same key', async () => {
    const service = make(); const one = await submit(service, 'diag_arrays_bounds', '4', 'same'); const two = await submit(service, 'diag_arrays_bounds', '5', 'same')
    expect(two).toEqual(one); expect(await service.getHistory('learner')).toHaveLength(1); expect((await service.getConcepts('learner')).find((x) => x.concept.id === 'arrays')?.mastery.attempts).toBe(1)
  })

  it('records uncertain answers exactly without mastery changes or a review', async () => {
    const service = make(); const result = await submit(service, 'diag_linked_lists_head_insert', 'somehow connect them', 'unclear')
    expect(result.attempt.answerText).toBe('somehow connect them'); expect(result.revisionTask).toBeNull()
    expect((await service.getConcepts('learner')).find((x) => x.concept.id === 'linked_lists')?.mastery.mastery).toBeNull()
  })

  it('preserves state when an evaluator fails', async () => {
    const service = createTracewiseService({ storage: new MemoryStorage(), clock: () => now, evaluator: async () => { throw new Error('offline') } })
    await expect(submit(service, 'diag_arrays_bounds', '4', 'failed')).rejects.toMatchObject({ code: 'EVALUATION_FAILED', details: { answerText: '4' } } satisfies Partial<ServiceError>)
    expect(await service.getHistory('learner')).toHaveLength(0)
  })

  it('captures linked-list self-loop evidence and a trace', async () => {
    const result = await submit(make(), 'diag_linked_lists_head_insert', 'make N the head then point N to the head', 'loop')
    expect(result.evaluation.misconception_code).toBe('LL_SELF_LOOP'); expect(result.trace).toBeTruthy(); expect(result.evaluation.evidence.every((quote) => result.attempt.answerText.includes(quote))).toBe(true)
  })

  it('moves misconceptions through verification and correction', async () => {
    const service = make()
    await submit(service, 'diag_arrays_bounds', '5', 'm1'); await submit(service, 'diag_arrays_bounds', '5', 'm2')
    expect((await service.getMisconceptions('learner'))[0].status).toBe('recurring')
    await submit(service, 'diag_arrays_bounds', '4', 'm3'); expect((await service.getMisconceptions('learner'))[0].status).toBe('needs_verification')
    await submit(service, 'arrays_sum_loop', '12', 'm4'); expect((await service.getMisconceptions('learner'))[0].status).toBe('corrected')
  })

  it('persists stored learner state and supports reset', async () => {
    const storage = new MemoryStorage(); const first = make(storage); await submit(first, 'diag_arrays_bounds', '4', 'persist'); await first.advanceDemoTime(2)
    const second = make(storage); expect(await second.getHistory('learner')).toHaveLength(1); await second.resetDemo('learner')
    expect(await second.getHistory('learner')).toHaveLength(0); expect(await second.advanceDemoTime(0)).toEqual(now)
  })

  it('keeps typed and dictated modes', async () => {
    const service = make(); expect((await submit(service, 'diag_arrays_bounds', '4', 'typed', 'typed')).attempt.inputMode).toBe('typed'); expect((await submit(service, 'diag_pointers_address', '7', 'dictated', 'dictated')).attempt.inputMode).toBe('dictated')
  })
})
