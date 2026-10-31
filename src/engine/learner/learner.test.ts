import { describe, expect, test } from 'vitest'
import type { EvaluationResult, MasteryState, Question, StudentMisconception } from '../contracts/index.js'
import { deriveStatus, updateMastery } from './model.js'
import { updateMisconception } from './misconceptions.js'

const now = new Date('2026-10-31T10:00:00.000Z')
const question = (difficulty: Question['difficulty'] = 'standard', isTransfer = false, conceptIds = ['arrays']): Question => ({ id: 'q1', conceptIds, type: 'explain', prompt: '', answerKey: '', difficulty, misconceptionMap: {}, isTransfer, supportsReplay: false })
const evaluation = (status: EvaluationResult['status'], code: string | null = null): EvaluationResult => ({ status, concept_id: 'arrays', misconception_code: code, evidence: [], confidence_band: 'high', explanation: '', corrective_explanation: '', follow_up_question_id: null, clarification_question: null, source: 'rule' })
const unassessed = (conceptId = 'arrays'): MasteryState => ({ conceptId, status: 'not_assessed', mastery: null, attempts: 0, lastUpdated: null })
const assessed = (mastery: number, attempts = 1): MasteryState => ({ conceptId: 'arrays', status: 'developing', mastery, attempts, lastUpdated: now.toISOString() })

describe('evidence-v1 mastery model', () => {
  test('first correct standard response from not_assessed gives 0.68', () => {
    const result = updateMastery({ state: { arrays: unassessed() }, question: question(), evaluation: evaluation('correct'), attemptId: 'a1', now })
    expect(result.newStates[0].mastery).toBe(0.68)
    expect(result.historyEntries[0].before.mastery).toBe(0.5)
    expect(result.historyEntries[0].reason).toContain('starting estimate')
  })
  test('incorrect lowers mastery and applies a misconception penalty', () => {
    expect(updateMastery({ state: { arrays: assessed(0.5) }, question: question(), evaluation: evaluation('incorrect', 'ARR'), attemptId: 'a2', now }).newStates[0].mastery).toBe(0.28)
  })
  test('transfer raises the learning rate', () => {
    expect(updateMastery({ state: { arrays: unassessed() }, question: question('standard', true), evaluation: evaluation('correct'), attemptId: 'a3', now }).newStates[0].mastery).toBe(0.72)
  })
  test('mastery is clamped at zero and one', () => {
    expect(updateMastery({ state: { arrays: assessed(0) }, question: question('challenge'), evaluation: evaluation('incorrect', 'ARR'), attemptId: 'a4', now }).newStates[0].mastery).toBe(0)
    expect(updateMastery({ state: { arrays: assessed(1, 3) }, question: question('challenge'), evaluation: evaluation('correct'), attemptId: 'a5', now }).newStates[0].mastery).toBe(1)
  })
  test('uncertain preserves score, increments attempts, and records history', () => {
    const result = updateMastery({ state: { arrays: unassessed() }, question: question(), evaluation: evaluation('uncertain'), attemptId: 'a6', now })
    expect(result.newStates[0]).toMatchObject({ status: 'developing', mastery: 0.5, attempts: 1 })
    expect(result.historyEntries[0].before.mastery).toBe(result.historyEntries[0].after.mastery)
    expect(result.historyEntries[0].reason).toContain('unclear')
  })
  test('confidence changes only sureButWrong', () => {
    const low = updateMastery({ state: { arrays: assessed(0.5) }, question: question(), evaluation: evaluation('incorrect'), attemptId: 'a7', confidence: 2, now })
    const high = updateMastery({ state: { arrays: assessed(0.5) }, question: question(), evaluation: evaluation('incorrect'), attemptId: 'a8', confidence: 5, now })
    expect(low.newStates[0].mastery).toBe(high.newStates[0].mastery)
    expect(low.flags.sureButWrong).toBe(false)
    expect(high.flags.sureButWrong).toBe(true)
  })
  test('updates every concept and derives due and strong statuses', () => {
    const result = updateMastery({ state: { arrays: unassessed(), pointers: unassessed('pointers') }, question: question('standard', false, ['arrays', 'pointers']), evaluation: evaluation('correct'), attemptId: 'multi', now })
    expect(result.newStates.map((state) => state.conceptId)).toEqual(['arrays', 'pointers'])
    expect(result.historyEntries.map((entry) => entry.id)).toEqual(['multi:arrays', 'multi:pointers'])
    expect(deriveStatus({ ...assessed(0.85, 2) }, true)).toBe('due')
    expect(deriveStatus(assessed(0.85, 2), false)).toBe('strong')
  })
})

describe('misconception transitions', () => {
  const existing: StudentMisconception = { code: 'ARR', status: 'suspected', count: 1, evidenceAttemptIds: ['old'] }
  test('incorrect evidence moves suspected to recurring and appends attempt', () => {
    expect(updateMisconception({ existing, evaluation: evaluation('incorrect', 'ARR'), questionId: 'q2', attemptId: 'new', evidenceQuestionIds: ['q1'] })).toEqual({ code: 'ARR', status: 'recurring', count: 2, evidenceAttemptIds: ['old', 'new'] })
  })
  test('correct on the same question needs verification', () => {
    expect(updateMisconception({ existing, evaluation: evaluation('correct'), questionId: 'q1', attemptId: 'new', evidenceQuestionIds: ['q1'] })?.status).toBe('needs_verification')
  })
  test('correct on a different question corrects the misconception', () => {
    expect(updateMisconception({ existing: { ...existing, status: 'recurring' }, evaluation: evaluation('correct'), questionId: 'q2', attemptId: 'new', evidenceQuestionIds: ['q1'] })?.status).toBe('corrected')
  })
  test('needs_verification requires a different question to correct', () => {
    const pending = { ...existing, status: 'needs_verification' as const }
    expect(updateMisconception({ existing: pending, evaluation: evaluation('correct'), questionId: 'q1', attemptId: 'a', evidenceQuestionIds: ['q1'] })?.status).toBe('needs_verification')
    expect(updateMisconception({ existing: pending, evaluation: evaluation('correct'), questionId: 'q2', attemptId: 'b', evidenceQuestionIds: ['q1'] })?.status).toBe('corrected')
  })
  test('partial, uncertain, and insufficient answers do not correct', () => {
    for (const status of ['partial', 'uncertain', 'insufficient_answer'] as const) {
      expect(updateMisconception({ existing, evaluation: evaluation(status), questionId: 'q2', attemptId: 'a', evidenceQuestionIds: ['q1'] })?.status).toBe('suspected')
    }
  })
})
