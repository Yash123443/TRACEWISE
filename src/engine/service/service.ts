import { z } from 'zod'
import type { EvaluationResult, Operation, Question, Trace } from '../contracts/index.js'
import { concepts, getQuestion as findQuestion, questions } from '../data/index.js'
import { evaluateWithRules } from '../evaluation/index.js'
import { deriveStatus, MODEL_VERSION, updateMastery, updateMisconception } from '../learner/index.js'
import { pickReviewQuestion, scheduleReview, selectNextQuestion, splitRevisionQueue } from '../selector/index.js'
import { runReplay as replay } from '../simulator/index.js'
import { ServiceError } from './errors.js'
import { parseState } from './state.js'
import type { LearnerState } from './state.js'
import type { EngineStorage } from './storage.js'
import { LocalStorageAdapter } from './storage.js'
import type { DiagnosticStatus, NextQuestionRecommendation, SubmitAnswerInput, SubmitAnswerResult, TracewiseService } from './types.js'

const InputSchema = z.object({ learnerId: z.string().min(1), questionId: z.string().min(1), answerText: z.string(), reasoningText: z.string().optional(), inputMode: z.enum(['typed', 'dictated']), confidence: z.number().int().min(1).max(5).optional(), idempotencyKey: z.string().min(1), now: z.date() })
type EvaluatorOutput = EvaluationResult | { evaluation: EvaluationResult; trace?: Trace }
export type ServiceEvaluator = (question: Question, answerText: string, reasoningText?: string, inputMode?: 'typed' | 'dictated', confidence?: number) => Promise<EvaluatorOutput> | EvaluatorOutput
export interface CreateServiceOptions { storage?: EngineStorage; evaluator?: ServiceEvaluator; clock?: () => Date }
const storageKey = (learnerId: string) => `learner:${learnerId}`
const offsetKey = 'demo-offset-days'

export function createTracewiseService({ storage = new LocalStorageAdapter(), evaluator = (q, answer, reasoning) => evaluateWithRules({ question: q, answerText: answer, reasoningText: reasoning }), clock = () => new Date() }: CreateServiceOptions = {}): TracewiseService {
  const load = (id: string) => parseState(storage.get(storageKey(id)), id)
  const save = (state: LearnerState) => storage.set(storageKey(state.learnerId), JSON.stringify(state))
  const offset = () => Number(storage.get(offsetKey) ?? '0') || 0
  const demoNow = () => new Date(clock().getTime() + offset() * 86400000)
  const getRecommendation = (state: LearnerState, now: Date): NextQuestionRecommendation | null => {
    const selected = selectNextQuestion({ concepts, questions, mastery: state.mastery, revisionTasks: state.revisionTasks, recentQuestionIds: state.attempts.map((a) => a.questionId), misconceptions: Object.values(state.misconceptions), now })
    return selected ? { question: selected.question, reason: selected.reason, difficulty: selected.difficulty } : null
  }
  return {
    async getConcepts(learnerId) { const state = load(learnerId); return concepts.map((concept) => { const mastery = state.mastery[concept.id]; const hasDue = state.revisionTasks.some((task) => task.conceptId === concept.id && task.status !== 'done' && new Date(task.dueDate).getTime() <= demoNow().getTime()); return { concept, mastery: { ...mastery, status: deriveStatus(mastery, hasDue) } } }) },
    async getDiagnosticQuestions() { return questions.filter((q) => q.id.startsWith('diag_')) },
    async getDiagnosticStatus(learnerId): Promise<DiagnosticStatus> { const state = load(learnerId); const diagnostic = questions.filter((q) => q.id.startsWith('diag_')); const answered = new Set(state.attempts.map((a) => a.questionId)); return { total: diagnostic.length, answered: diagnostic.filter((q) => answered.has(q.id)).length, complete: diagnostic.every((q) => answered.has(q.id)), baseline: diagnostic.map((q) => { const m = state.mastery[q.conceptIds[0]]; return { conceptId: q.conceptIds[0], status: m.status, mastery: m.mastery } }) } },
    async submitAnswer(raw: SubmitAnswerInput): Promise<SubmitAnswerResult> {
      const input = InputSchema.parse(raw); const state = load(input.learnerId); const stored = state.results[input.idempotencyKey]; if (stored) return stored
      const question = findQuestion(input.questionId); if (!question) throw new ServiceError('QUESTION_NOT_FOUND', 'The requested question was not found.', { questionId: input.questionId })
      let output: EvaluatorOutput
      try { output = await evaluator(question, input.answerText, input.reasoningText, input.inputMode, input.confidence) } catch (cause) { throw new ServiceError('EVALUATION_FAILED', 'The answer could not be evaluated.', { answerText: input.answerText, cause }) }
      const evaluation = 'evaluation' in output ? output.evaluation : output
      const trace = 'evaluation' in output ? output.trace : undefined
      const attemptId = `attempt:${input.idempotencyKey}`
      const attempt = { id: attemptId, idempotencyKey: input.idempotencyKey, learnerId: input.learnerId, questionId: question.id, answerText: input.answerText, ...(input.reasoningText === undefined ? {} : { reasoningText: input.reasoningText }), inputMode: input.inputMode, ...(input.confidence === undefined ? {} : { confidence: input.confidence }), submittedAt: input.now.toISOString(), evaluation, evaluationSource: evaluation.source }
      const next: LearnerState = { ...state, mastery: { ...state.mastery }, attempts: [...state.attempts, attempt], history: [...state.history], misconceptions: { ...state.misconceptions }, revisionTasks: state.revisionTasks.map((t) => ({ ...t })), conceptStages: { ...state.conceptStages }, results: { ...state.results } }
      const unclear = evaluation.status === 'uncertain' || evaluation.status === 'insufficient_answer'
      const update = unclear
        ? { newStates: [], historyEntries: question.conceptIds.map((conceptId) => ({ id: `${attemptId}:${conceptId}`, attemptId, conceptId, questionId: question.id, before: { ...next.mastery[conceptId] }, after: { ...next.mastery[conceptId] }, reason: 'The answer was unclear, so mastery did not change. This is an estimate from recorded evidence.', modelVersion: MODEL_VERSION, timestamp: input.now.toISOString() })), flags: { sureButWrong: false } }
        : updateMastery({ state: next.mastery, question, evaluation, attemptId, confidence: input.confidence, now: input.now })
      for (const mastery of update.newStates) next.mastery[mastery.conceptId] = mastery
      next.history.push(...update.historyEntries)
      let revisionTask = null
      if (!unclear) next.revisionTasks = next.revisionTasks.map((task) => question.conceptIds.includes(task.conceptId) && task.status === 'due' ? { ...task, status: 'done' } : task)
      if (!unclear) for (const conceptId of question.conceptIds) {
        const existing = evaluation.misconception_code ? next.misconceptions[evaluation.misconception_code] : undefined
        if (evaluation.misconception_code || evaluation.status === 'correct') {
          const relevant = Object.values(next.misconceptions).find((m) => concepts.find((c) => c.id === conceptId)?.misconceptionCodes.includes(m.code))
          if (relevant) next.misconceptions[relevant.code] = updateMisconception({ existing: relevant, evaluation, questionId: question.id, attemptId, evidenceQuestionIds: next.attempts.filter((a) => relevant.evidenceAttemptIds.includes(a.id)).map((a) => a.questionId) })!
          else if (evaluation.misconception_code) next.misconceptions[evaluation.misconception_code] = updateMisconception({ existing, evaluation, questionId: question.id, attemptId, evidenceQuestionIds: [] })!
        }
        const reviewQuestion = pickReviewQuestion({ conceptId, lastQuestionId: question.id, masteryState: next.mastery[conceptId], questions, misconceptionActive: Boolean(evaluation.misconception_code) })
        const scheduled = scheduleReview({ conceptId, conceptName: concepts.find((c) => c.id === conceptId)?.name, evaluationStatus: evaluation.status, previousStage: next.conceptStages[conceptId], hasMisconception: Boolean(evaluation.misconception_code), questionId: reviewQuestion?.id ?? question.id, now: input.now })
        if (scheduled) { next.conceptStages[conceptId] = scheduled.stage; next.revisionTasks = next.revisionTasks.map((task) => task.conceptId === conceptId && task.status !== 'done' ? { ...task, status: 'done' } : task); const task = { ...scheduled.task, id: `revision:${attemptId}:${conceptId}`, priority: scheduled.task.priority === 'high' ? 3 : scheduled.task.priority === 'medium' ? 2 : 1 }; next.revisionTasks.push(task); revisionTask ??= task }
      }
      const recommendation = getRecommendation(next, input.now)
      const result: SubmitAnswerResult = { attempt, evaluation, ...(trace ? { trace } : {}), historyEntry: update.historyEntries[0], nextRecommendation: recommendation ? { questionId: recommendation.question.id, reason: recommendation.reason, difficulty: recommendation.difficulty } : null, revisionTask }
      next.results[input.idempotencyKey] = result; save(next); return result
    },
    async getNextQuestion(learnerId, now) { const recommendation = getRecommendation(load(learnerId), now); if (!recommendation) throw new ServiceError('NO_RECOMMENDATION', 'No question is available.') ; return recommendation },
    async getRevisionQueue(learnerId, now) { return splitRevisionQueue(load(learnerId).revisionTasks, now) },
    async getQuestion(questionId) { const question = findQuestion(questionId); if (!question) throw new ServiceError('QUESTION_NOT_FOUND', 'The requested question was not found.', { questionId }); return question },
    async getMisconceptions(learnerId) { return Object.values(load(learnerId).misconceptions) },
    async getHistory(learnerId) { return [...load(learnerId).history].reverse() },
    async getTeacherAnalytics() { throw new ServiceError('NOT_IMPLEMENTED', 'Teacher analytics are not implemented yet.') },
    runReplay(operations: Operation[], initial?) { return replay(operations, initial) },
    async resetDemo(learnerId) { storage.remove(storageKey(learnerId)); storage.remove(offsetKey) },
    async advanceDemoTime(days) { const value = offset() + days; storage.set(offsetKey, String(value)); return demoNow() },
  }
}
