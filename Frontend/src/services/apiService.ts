import { createBrowserService } from '@engine/service'
import { concepts, misconceptions } from '@engine/data'
import type { Question, RevisionTask, Trace } from '@engine/contracts'
import type { SubmitAnswerResult } from '@engine/service'
import type { ReplayInitialState } from '@engine/simulator'
import type { Operation } from '@engine/contracts'
import type { LearningQuestion } from '../types/tracewise'

export interface SubmitTraceResponse extends SubmitAnswerResult {
  submissionId: string
  status: 'EVALUATED'
  note: string
  receivedAt: string
  summary: { questionId: string; wordCount: number; characterCount: number; inputMethod: 'typed' | 'dictated' | 'hybrid' }
}

export interface StudentOverviewData {
  nextAction: { questionId: string; title: string; category: string; difficulty: 'Foundational' | 'Intermediate' | 'Advanced'; estimatedMinutes: number; coreReasoningChallenge: string; whyRecommended: string }
}

export const learnerId = 'demo_learner'
export const service = createBrowserService()
export const demoNow = () => service.advanceDemoTime(0)
export const mapQuestion = (question: Question): LearningQuestion => ({
  id: question.id, title: question.prompt.split('\n')[0], category: question.conceptIds.map((id) => concepts.find((c) => c.id === id)?.name ?? id).join(', '),
  difficulty: ({ intro: 'Foundational', standard: 'Intermediate', challenge: 'Advanced' } as const)[question.difficulty],
  examContext: 'Tracewise diagnostic question', statement: question.prompt, constraints: question.options ?? [], examples: [],
  reasoningGoal: question.type === 'explain' ? 'Explain your reasoning.' : 'Trace the state changes and give the result.', targetComplexity: { time: 'Not specified', space: 'Not specified' },
  keyInvariantsToAddress: question.conceptIds.map((id) => concepts.find((c) => c.id === id)?.name ?? id), defaultStarterTrace: '',
})
export const TracewiseApi = {
  getQuestions: async () => {
    const status = await service.getDiagnosticStatus(learnerId)
    if (!status.complete) {
      const answered = new Set((await service.getHistory(learnerId)).map((entry) => entry.questionId))
      return (await service.getDiagnosticQuestions()).filter((q) => !answered.has(q.id)).map(mapQuestion)
    }
    const next = await service.getNextQuestion(learnerId, await demoNow())
    const question = mapQuestion(next.question)
    return [{ ...question, recommendationReason: next.reason }]
  },
  getQuestion: async (id: string) => mapQuestion(await service.getQuestion(id)),
  getDiagnosticStatus: () => service.getDiagnosticStatus(learnerId),
  getConcepts: () => service.getConcepts(learnerId),
  getMisconceptions: () => service.getMisconceptions(learnerId),
  getHistory: () => service.getHistory(learnerId),
  getNextQuestion: async () => service.getNextQuestion(learnerId, await demoNow()),
  getRevisionQueue: async () => service.getRevisionQueue(learnerId, await demoNow()),
  getTeacherAnalytics: () => service.getTeacherAnalytics(),
  submitAnswer: async (input: { questionId: string; answerText: string; inputMode: 'typed' | 'dictated'; confidence?: number; idempotencyKey: string }): Promise<SubmitAnswerResult> => service.submitAnswer({ learnerId, ...input, now: await demoNow() }),
  submitTrace: async (payload: { questionId: string; answerText: string; inputMethod: 'typed' | 'dictated' | 'hybrid'; submittedAt: string; confidence?: number; idempotencyKey?: string }): Promise<{ data: SubmitTraceResponse }> => {
    const result = await service.submitAnswer({ learnerId, questionId: payload.questionId, answerText: payload.answerText, inputMode: payload.inputMethod === 'dictated' ? 'dictated' : 'typed', ...(payload.confidence === undefined ? {} : { confidence: payload.confidence }), idempotencyKey: payload.idempotencyKey ?? crypto.randomUUID(), now: await demoNow() })
    return { data: { ...result, submissionId: result.attempt.id, status: 'EVALUATED', note: 'Evaluated and saved in this browser.', receivedAt: result.attempt.submittedAt, summary: { questionId: result.attempt.questionId, wordCount: result.attempt.answerText.trim().split(/\s+/).filter(Boolean).length, characterCount: result.attempt.answerText.length, inputMethod: payload.inputMethod } } }
  },
  runReplay: (operations: Operation[], initial?: ReplayInitialState): Trace | Promise<Trace> => service.runReplay(operations, initial),
  advanceDemoTime: (days: number) => service.advanceDemoTime(days),
  resetDemo: () => service.resetDemo(learnerId),
  misconceptionName: (code: string | null) => misconceptions.find((item) => item.code === code)?.name ?? null,
  questionForTask: (task: RevisionTask) => service.getQuestion(task.questionId),
}
