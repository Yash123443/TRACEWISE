import type { EvaluationResult, StudentMisconception } from '../contracts/index.js'

export interface UpdateMisconceptionInput { existing?: StudentMisconception; evaluation: EvaluationResult; questionId: string; attemptId: string; evidenceQuestionIds: string[] }

export function updateMisconception({ existing, evaluation, questionId, attemptId, evidenceQuestionIds }: UpdateMisconceptionInput): StudentMisconception | null {
  if (evaluation.status === 'incorrect' && evaluation.misconception_code) {
    if (existing && existing.code !== evaluation.misconception_code) return { code: evaluation.misconception_code, status: 'suspected', count: 1, evidenceAttemptIds: [attemptId] }
    const count = (existing?.count ?? 0) + 1
    return { code: evaluation.misconception_code, status: !existing ? 'suspected' : 'recurring', count, evidenceAttemptIds: [...(existing?.evidenceAttemptIds ?? []), attemptId] }
  }
  if (evaluation.status === 'correct' && existing && ['suspected', 'recurring', 'needs_verification'].includes(existing.status)) {
    const sameQuestion = evidenceQuestionIds.includes(questionId)
    const status = sameQuestion ? 'needs_verification' : 'corrected'
    return { ...existing, status }
  }
  return existing ?? null
}
