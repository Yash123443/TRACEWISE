import type {
  Attempt, MasteryHistoryEntry, MasteryState, RevisionTask, StudentMisconception,
  TeacherAggregate,
} from '../contracts/index.js'
import { concepts, questions } from '../data/index.js'
import { evaluateWithRules } from '../evaluation/index.js'
import { deriveStatus, updateMastery, updateMisconception } from '../learner/index.js'
import { scheduleReview, selectNextQuestion, splitRevisionQueue } from '../selector/index.js'
import { runReplay } from '../simulator/index.js'
import type { TracewiseService } from './types.js'
import { BrowserTracewiseStorage } from './storage.js'
import type { TracewiseStorage } from './storage.js'

interface LearnerState {
  mastery: Record<string, MasteryState>
  attempts: Attempt[]
  history: MasteryHistoryEntry[]
  misconceptions: StudentMisconception[]
  revisions: RevisionTask[]
  revisionStages: Record<string, number>
  recentQuestionIds: string[]
}

const emptyState = (): LearnerState => ({
  mastery: {}, attempts: [], history: [], misconceptions: [], revisions: [], revisionStages: {}, recentQuestionIds: [],
})
const prefix = 'tracewise:learner:'
const makeId = (kind: string) => `${kind}_${globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)}`
const priorityNumber = { low: 1, medium: 2, high: 3 } as const

/** Learning-engine service using the browser storage adapter; injectable storage keeps it portable. */
export class LocalTracewiseService implements TracewiseService {
  private readonly storage: TracewiseStorage

  constructor(storage: TracewiseStorage = new BrowserTracewiseStorage()) {
    this.storage = storage
  }

  private read(learnerId: string): LearnerState {
    try {
      const raw = this.storage.get(`${prefix}${encodeURIComponent(learnerId)}`)
      return raw ? { ...emptyState(), ...JSON.parse(raw) as Partial<LearnerState> } : emptyState()
    } catch {
      return emptyState()
    }
  }

  private write(learnerId: string, state: LearnerState): void {
    this.storage.set(`${prefix}${encodeURIComponent(learnerId)}`, JSON.stringify(state))
  }

  async getConcepts(learnerId: string) {
    const state = this.read(learnerId)
    return concepts.map((concept) => ({
      concept,
      mastery: state.mastery[concept.id] ?? {
        conceptId: concept.id, status: 'not_assessed' as const, mastery: null, attempts: 0, lastUpdated: null,
      },
    }))
  }

  async getDiagnosticQuestions() {
    return questions
  }

  async submitAnswer(input: Parameters<TracewiseService['submitAnswer']>[0]) {
    const state = this.read(input.learnerId)
    const previous = state.attempts.find((attempt) => attempt.idempotencyKey === input.idempotencyKey)
    if (previous) {
      const historyEntry = state.history.find((entry) => entry.attemptId === previous.id) ?? state.history[0]
      const recommendation = await this.getNextQuestion(input.learnerId, input.now)
      const revisionTask = state.revisions.find((task) => task.questionId === previous.questionId) ?? state.revisions[0]
      if (!historyEntry || !revisionTask) throw new Error('Saved attempt is missing its linked engine records.')
      return { attempt: previous, evaluation: previous.evaluation, historyEntry, nextRecommendation: { questionId: recommendation.question.id, reason: recommendation.reason, difficulty: recommendation.difficulty }, revisionTask }
    }

    const question = questions.find((item) => item.id === input.questionId)
    if (!question) throw new Error(`Unknown question: ${input.questionId}`)
    const attemptId = makeId('attempt')
    const result = evaluateWithRules({ question, answerText: input.answerText })
    const attempt: Attempt = {
      id: attemptId,
      idempotencyKey: input.idempotencyKey,
      learnerId: input.learnerId,
      questionId: question.id,
      answerText: input.answerText,
      inputMode: input.inputMode,
      ...(input.confidence === undefined ? {} : { confidence: input.confidence }),
      submittedAt: input.now.toISOString(),
      evaluation: result.evaluation,
      evaluationSource: result.evaluation.source,
    }

    const masteryResult = updateMastery({
      state: state.mastery, question, evaluation: result.evaluation, attemptId, confidence: input.confidence, now: input.now,
    })
    state.mastery = { ...state.mastery, ...Object.fromEntries(masteryResult.newStates.map((item) => [item.conceptId, item])) }
    state.history.push(...masteryResult.historyEntries)
    state.attempts.push(attempt)
    state.recentQuestionIds.push(question.id)
    state.recentQuestionIds = state.recentQuestionIds.slice(-12)

    const conceptCodes = new Set(question.conceptIds.flatMap((conceptId) => concepts.find((item) => item.id === conceptId)?.misconceptionCodes ?? []))
    for (const existing of state.misconceptions) {
      if (result.evaluation.status !== 'correct') continue
      if (!conceptCodes.has(existing.code)) continue
      const updated = updateMisconception({
        existing,
        evaluation: result.evaluation,
        questionId: question.id,
        attemptId,
        evidenceQuestionIds: state.attempts.filter((item) => item.evaluation.misconception_code === existing.code).map((item) => item.questionId),
      })
      if (updated) Object.assign(existing, updated)
    }
    if (result.evaluation.misconception_code) {
      const existing = state.misconceptions.find((item) => item.code === result.evaluation.misconception_code)
      const updated = updateMisconception({
        existing, evaluation: result.evaluation, questionId: question.id, attemptId,
        evidenceQuestionIds: state.attempts.filter((item) => item.evaluation.misconception_code === result.evaluation.misconception_code).map((item) => item.questionId),
      })
      if (updated && !existing) state.misconceptions.push(updated)
    }

    let revisionTask: RevisionTask | undefined
    for (const conceptId of question.conceptIds) {
      const concept = concepts.find((item) => item.id === conceptId)
      const activeMisconception = state.misconceptions.some((item) => concept?.misconceptionCodes.includes(item.code) && item.status !== 'corrected')
      const candidate = questions.find((item) => item.id !== question.id && item.conceptIds.includes(conceptId)) ?? question
      const scheduled = scheduleReview({
        conceptId,
        conceptName: concept?.name,
        evaluationStatus: result.evaluation.status,
        previousStage: state.revisionStages[conceptId] ?? -1,
        hasMisconception: activeMisconception,
        questionId: candidate.id,
        now: input.now,
      })
      if (!scheduled) continue
      state.revisionStages[conceptId] = scheduled.stage
      revisionTask = {
        ...scheduled.task,
        id: makeId('revision'),
        priority: priorityNumber[scheduled.task.priority],
      }
      state.revisions.push(revisionTask)
    }
    if (!revisionTask) {
      revisionTask = state.revisions.at(-1) ?? {
        id: makeId('revision'), conceptId: question.conceptIds[0], questionId: question.id,
        dueDate: input.now.toISOString(), priority: 1, reason: 'No review was scheduled for this response.', status: 'done',
      }
      if (!state.revisions.includes(revisionTask)) state.revisions.push(revisionTask)
    }

    for (const updated of masteryResult.newStates) {
      const hasDue = state.revisions.some((task) => task.conceptId === updated.conceptId && task.status !== 'done' && new Date(task.dueDate).getTime() <= input.now.getTime())
      state.mastery[updated.conceptId] = { ...updated, status: deriveStatus(updated, hasDue) }
    }
    const next = await this.getNextQuestion(input.learnerId, input.now, state)
    const historyEntry = masteryResult.historyEntries[0]
    if (!historyEntry) throw new Error('The answer did not map to a concept history entry.')
    this.write(input.learnerId, state)
    return {
      attempt,
      evaluation: result.evaluation,
      ...(result.trace ? { trace: result.trace } : {}),
      historyEntry,
      nextRecommendation: { questionId: next.question.id, reason: next.reason, difficulty: next.difficulty },
      revisionTask,
    }
  }

  async getNextQuestion(learnerId: string, now: Date, currentState = this.read(learnerId)) {
    const selected = selectNextQuestion({
      concepts, questions, mastery: currentState.mastery, revisionTasks: currentState.revisions,
      recentQuestionIds: currentState.recentQuestionIds, misconceptions: currentState.misconceptions, now,
    })
    const question = selected?.question ?? questions[0]
    if (!question) throw new Error('The engine has no diagnostic questions.')
    return selected ?? { question, reason: 'Start with the first available diagnostic question.', difficulty: question.difficulty }
  }

  async getRevisionQueue(learnerId: string, now: Date) {
    const tasks = this.read(learnerId).revisions
    return { ...splitRevisionQueue(tasks, now), completed: tasks.filter((task) => task.status === 'done') }
  }

  async completeRevision(learnerId: string, revisionId: string, now: Date) {
    const state = this.read(learnerId)
    const task = state.revisions.find((item) => item.id === revisionId)
    if (!task) throw new Error(`Unknown revision: ${revisionId}`)
    task.status = 'done'
    task.completedAt = now.toISOString()
    const mastery = state.mastery[task.conceptId]
    if (mastery) state.mastery[task.conceptId] = { ...mastery, status: deriveStatus(mastery, false), lastUpdated: now.toISOString() }
    this.write(learnerId, state)
    return task
  }

  async reopenRevision(learnerId: string, revisionId: string) {
    const state = this.read(learnerId)
    const task = state.revisions.find((item) => item.id === revisionId)
    if (!task) throw new Error(`Unknown revision: ${revisionId}`)
    task.status = 'scheduled'
    delete task.completedAt
    this.write(learnerId, state)
    return task
  }

  async getHistory(learnerId: string) { return this.read(learnerId).history }
  async getAttempts(learnerId: string) { return this.read(learnerId).attempts }

  async getTeacherAnalytics(): Promise<TeacherAggregate> {
    const learners = this.storage.keys(prefix).map((key) => {
      try { return { id: decodeURIComponent(key.slice(prefix.length)), state: JSON.parse(this.storage.get(key) ?? '{}') as LearnerState } }
      catch { return null }
    }).filter((item): item is { id: string; state: LearnerState } => item !== null)
    const conceptMastery = concepts.flatMap((concept) => {
      const states = learners.map((learner) => learner.state.mastery?.[concept.id]).filter((item): item is MasteryState => Boolean(item && item.status !== 'not_assessed' && item.mastery !== null))
      if (!states.length) return []
      const distribution: Record<string, number> = {}
      for (const item of states) distribution[item.status] = (distribution[item.status] ?? 0) + 1
      return [{ conceptId: concept.id, average: states.reduce((sum, item) => sum + (item.mastery ?? 0), 0) / states.length, distribution }]
    })
    const misconceptionCounts = new Map<string, number>()
    for (const learner of learners) for (const item of learner.state.misconceptions ?? []) {
      if (item.status !== 'corrected') misconceptionCounts.set(item.code, (misconceptionCounts.get(item.code) ?? 0) + item.count)
    }
    const topMisconceptions = [...misconceptionCounts].map(([code, count]) => ({ code, count })).sort((a, b) => b.count - a.count)
    const learnersNeedingAttention = learners.flatMap(({ id, state }) => {
      const assessed = Object.values(state.mastery ?? {}).filter((item) => item.mastery !== null)
      const score = assessed.length ? assessed.reduce((sum, item) => sum + (item.mastery ?? 0), 0) / assessed.length : null
      const active = (state.misconceptions ?? []).filter((item) => item.status !== 'corrected')
      return score !== null && (score <= 0.4 || active.length > 0)
        ? [{ learnerId: id, reason: score <= 0.4 ? 'Recorded evidence score is at or below the 0.4 attention threshold.' : 'Active misconception evidence needs review.' }]
        : []
    })
    return {
      dataSource: 'simulated', learnerCount: learners.length, conceptMastery, topMisconceptions,
      learnersNeedingAttention, attentionThreshold: 0.4,
      reteachOutline: topMisconceptions.length ? [`Review ${topMisconceptions[0].code} using a new transfer question.`] : [],
    }
  }

  runReplay(operations: Parameters<typeof runReplay>[0]) { return runReplay(operations) }

  async resetDemo(learnerId: string) { this.storage.remove(`${prefix}${encodeURIComponent(learnerId)}`) }

  async advanceDemoTime(days: number, now: Date) {
    const key = 'tracewise:demo-clock'
    const current = this.storage.get(key)
    const currentTime = current ? new Date(current) : now
    currentTime.setDate(currentTime.getDate() + days)
    this.storage.set(key, currentTime.toISOString())
    return currentTime
  }
}

export const tracewiseService = new LocalTracewiseService()
