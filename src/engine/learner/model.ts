import type { EvaluationResult, MasteryHistoryEntry, MasteryState, Question } from '../contracts/index.js'

// evidence-v1 is a deterministic evidence score, not a probabilistic learner model.
// Unassessed concepts begin from a 0.5 prior; outcomes move that estimate toward
// fixed correctness targets at a rate determined by question difficulty and transfer.
// Unclear answers preserve the score while still recording an attempt.
export const MODEL_VERSION = 'evidence-v1' as const
const round2 = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100

export function deriveStatus(state: MasteryState, hasDueTask: boolean): MasteryState['status'] {
  if (state.attempts === 0) return 'not_assessed'
  if (hasDueTask) return 'due'
  return (state.mastery ?? 0) >= 0.8 && state.attempts >= 2 ? 'strong' : 'developing'
}

export interface UpdateMasteryInput {
  state: Record<string, MasteryState>
  question: Question
  evaluation: EvaluationResult
  attemptId: string
  confidence?: number
  now: Date
}
export interface UpdateMasteryResult { newStates: MasteryState[]; historyEntries: MasteryHistoryEntry[]; flags: { sureButWrong: boolean } }

export function updateMastery({ state, question, evaluation, attemptId, confidence, now }: UpdateMasteryInput): UpdateMasteryResult {
  const rates = { intro: 0.25, standard: 0.35, challenge: 0.45 }
  const newStates: MasteryState[] = []
  const historyEntries: MasteryHistoryEntry[] = []
  for (const conceptId of question.conceptIds) {
    const existing = state[conceptId] ?? { conceptId, status: 'not_assessed' as const, mastery: null, attempts: 0, lastUpdated: null }
    const wasUnassessed = existing.status === 'not_assessed' || existing.mastery === null
    const oldValue = wasUnassessed ? 0.5 : existing.mastery ?? 0.5
    let nextValue = oldValue
    if (evaluation.status === 'correct' || evaluation.status === 'partial' || evaluation.status === 'incorrect') {
      const target = evaluation.status === 'correct' ? 1 : evaluation.status === 'partial' ? 0.55 : 0
      const rate = Math.min(0.6, rates[question.difficulty] * (question.isTransfer ? 1.25 : 1))
      nextValue = oldValue + rate * (target - oldValue)
      if (evaluation.status === 'incorrect' && evaluation.misconception_code) nextValue -= 0.05
      nextValue = round2(Math.max(0, Math.min(1, nextValue)))
    }
    const attempts = existing.attempts + 1
    const provisional: MasteryState = {
      conceptId,
      status: attempts === 0 ? 'not_assessed' : 'developing',
      mastery: attempts === 0 ? null : nextValue,
      attempts,
      lastUpdated: now.toISOString(),
    }
    const after: MasteryState = { ...provisional, status: deriveStatus(provisional, false) }
    const before: MasteryState = wasUnassessed ? { ...existing, mastery: 0.5 } : existing
    let reason = evaluation.status === 'uncertain' || evaluation.status === 'insufficient_answer'
      ? 'The answer was unclear, so mastery did not change.'
      : `A ${question.difficulty} ${evaluation.status}${question.isTransfer ? ' transfer' : ''} response updated the evidence score${evaluation.misconception_code ? `; misconception code ${evaluation.misconception_code} added a penalty` : ''}.`
    if (wasUnassessed) reason += ' The prior 0.5 is the starting estimate.'
    reason += ' This is an estimate from recorded evidence.'
    newStates.push(after)
    historyEntries.push({ id: `${attemptId}:${conceptId}`, attemptId, conceptId, questionId: question.id, before, after, reason, modelVersion: MODEL_VERSION, timestamp: now.toISOString() })
  }
  return { newStates, historyEntries, flags: { sureButWrong: confidence !== undefined && confidence >= 4 && evaluation.status === 'incorrect' } }
}
