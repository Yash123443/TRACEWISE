import type {
  ConceptCategoryProgress, DueRevisionItem, LearningQuestion, RecentActivityItem,
  TeacherCohortMetric, TraceSubmissionPayload,
} from '../types/tracewise'
import type { TeacherAnalyticsData } from '../types/teacherAnalytics'
import type { RevisionItem, RevisionQueueFixture } from '../types/revision'
import { DEMO_METADATA, DEMO_TEACHER_METRIC } from '../mock/demoData'
import { TEACHER_ANALYTICS_FIXTURE } from '../mock/teacherAnalyticsFixture'
import { tracewiseService } from '../../../TRACEWISE/src/engine/service/index.js'
import type { Question, RevisionTask } from '../../../TRACEWISE/src/engine/contracts/index.js'
import { concepts as engineConcepts } from '../../../TRACEWISE/src/engine/data/index.js'
import type { TeacherAggregate } from '../../../TRACEWISE/src/engine/contracts/index.js'

export interface ApiResponse<T> { success: boolean; data: T; isMock: boolean; message?: string; timestamp: string }

export interface StudentOverviewData {
  metadata: Omit<typeof DEMO_METADATA, 'isMockData' | 'studentProfile'> & {
    isMockData: boolean
    studentProfile: Omit<typeof DEMO_METADATA.studentProfile, 'id' | 'name' | 'overallRetention' | 'activeStreakDays'> & {
      id: string; name: string; overallRetention: number | null; activeStreakDays: number | null
    }
  }
  nextAction: { questionId: string; title: string; category: string; difficulty: 'Foundational' | 'Intermediate' | 'Advanced'; estimatedMinutes: number; coreReasoningChallenge: string; whyRecommended: string }
  conceptProgress: ConceptCategoryProgress[]
  dueRevisions: DueRevisionItem[]
  recentActivities: RecentActivityItem[]
}

export interface SubmitTraceResponse {
  submissionId: string
  status: 'EVALUATED'
  receivedAt: string
  summary: { questionId: string; wordCount: number; characterCount: number; inputMethod: 'typed' | 'dictated' | 'hybrid' }
  note: string
  evaluation: { status: string; source: 'llm' | 'rule' | 'fixture'; evidence: string[]; explanation: string; correctiveExplanation: string; clarificationQuestion: string | null }
}

const learnerId = 'local-demo-learner'
const colors = ['#0d9488', '#2563eb', '#d97706', '#7c3aed', '#0891b2']
const difficulty = (value: Question['difficulty']): LearningQuestion['difficulty'] => ({ intro: 'Foundational', standard: 'Intermediate', challenge: 'Advanced' } as const)[value]
const mapQuestion = (question: Question): LearningQuestion => ({
  id: question.id,
  title: question.prompt.split('\n')[0].slice(0, 90),
  category: question.conceptIds.map((id) => engineConcepts.find((concept) => concept.id === id)?.name ?? id).join(', '),
  difficulty: difficulty(question.difficulty),
  examContext: 'Tracewise diagnostic question',
  statement: question.prompt,
  constraints: question.options ?? [],
  examples: [],
  reasoningGoal: question.type === 'explain' ? 'Explain the reasoning behind your answer.' : 'Trace the state changes and give the result.',
  targetComplexity: { time: 'Not specified', space: 'Not specified' },
  keyInvariantsToAddress: question.conceptIds.map((id) => engineConcepts.find((concept) => concept.id === id)?.name ?? id),
  defaultStarterTrace: '',
})

const formatDue = (task: RevisionTask, now: Date) => {
  if (task.status === 'done') return 'Completed'
  const days = Math.ceil((new Date(task.dueDate).getTime() - now.getTime()) / 86_400_000)
  return days <= 0 ? 'Due Now' : `Upcoming in ${days} day${days === 1 ? '' : 's'}`
}

const mapRevision = (task: RevisionTask, now: Date, questions: Question[]): RevisionItem => {
    const conceptName = engineConcepts.find((item) => item.id === task.conceptId)?.name ?? task.conceptId
  const question = questions.find((item) => item.id === task.questionId)
  const completed = task.status === 'done'
  return {
    id: task.id,
    conceptId: task.conceptId,
    conceptTitle: conceptName,
    questionId: task.questionId,
    questionTitle: question?.prompt.split('\n')[0] ?? task.questionId,
    category: conceptName,
    dueStatus: completed ? 'completed' : new Date(task.dueDate).getTime() <= now.getTime() ? 'due_now' : 'upcoming',
    dueBadgeText: formatDue(task, now),
    scheduleReason: task.reason,
    ...(question ? { difficulty: difficulty(question.difficulty) } : {}),
    isDemoRecord: true,
    ...(completed ? { completedAt: task.completedAt ?? task.dueDate } : {}),
  }
}

const wrap = <T>(data: T, isMock = false): ApiResponse<T> => ({ success: true, data, isMock, timestamp: new Date().toISOString() })

export const TracewiseApi = {
  async getQuestions(): Promise<ApiResponse<LearningQuestion[]>> {
    return wrap((await tracewiseService.getDiagnosticQuestions()).map(mapQuestion))
  },

  async getQuestion(questionId: string): Promise<ApiResponse<LearningQuestion>> {
    const questions = await tracewiseService.getDiagnosticQuestions()
    const question = questions.find((item) => item.id === questionId) ?? questions[0]
    if (!question) throw new Error('No diagnostic questions are available.')
    return wrap(mapQuestion(question))
  },

  async getStudentOverview(): Promise<ApiResponse<StudentOverviewData>> {
    const now = new Date()
    const [learnerConcepts, questions, recommendation, revisions, attempts] = await Promise.all([
      tracewiseService.getConcepts(learnerId),
      tracewiseService.getDiagnosticQuestions(),
      tracewiseService.getNextQuestion(learnerId, now),
      tracewiseService.getRevisionQueue(learnerId, now),
      tracewiseService.getAttempts(learnerId),
    ])
    const conceptProgress: ConceptCategoryProgress[] = learnerConcepts.map(({ concept, mastery }, index) => {
      const status = mastery.status === 'strong' ? 'solidified' : mastery.status === 'due' ? 'needs-review' : mastery.status === 'developing' ? 'in-progress' : 'unattempted'
      const score = mastery.mastery === null ? null : Math.round(mastery.mastery * 100)
      return {
        category: concept.name,
        color: colors[index % colors.length],
        totalConcepts: 1,
        solidifiedCount: status === 'solidified' ? 1 : 0,
        averageMastery: score,
        concepts: [{ id: concept.id, name: concept.name, category: concept.name, masteryPercent: score, status, prerequisites: concept.prerequisites.map((item) => item.conceptId) }],
      }
    })
    const taskItems = [...revisions.due, ...revisions.upcoming]
    const dueRevisions = taskItems.map((task) => ({
      id: task.id,
      conceptId: task.conceptId,
      title: questions.find((question) => question.id === task.questionId)?.prompt.split('\n')[0] ?? task.questionId,
      category: engineConcepts.find((concept) => concept.id === task.conceptId)?.name ?? task.conceptId,
      dueLabel: formatDue(task, now),
      urgency: task.priority >= 3 ? 'high' as const : task.priority === 2 ? 'medium' as const : 'low' as const,
      lastReasoningFlaw: task.reason,
    }))
    const recentActivities: RecentActivityItem[] = attempts.slice(-5).reverse().map((attempt) => {
      const status = attempt.evaluation.status
      return {
        id: attempt.id,
        problemId: attempt.questionId,
        problemTitle: questions.find((question) => question.id === attempt.questionId)?.prompt.split('\n')[0] ?? attempt.questionId,
        category: attempt.evaluation.concept_id.replaceAll('_', ' '),
        timestamp: attempt.submittedAt,
        focusType: 'Invariant Trace',
        outcomeLabel: `${status} · ${attempt.evaluation.source}`,
        reasoningSnippet: attempt.answerText,
      }
    })
    const recommended = mapQuestion(recommendation.question)
    return wrap({
      metadata: {
        ...DEMO_METADATA,
        isMockData: false,
        datasetName: 'Local Tracewise learning engine',
        studentProfile: { ...DEMO_METADATA.studentProfile, id: learnerId, name: 'Local learner', overallRetention: null, activeStreakDays: null },
      },
      nextAction: {
        questionId: recommended.id, title: recommended.title, category: recommended.category,
        difficulty: recommended.difficulty, estimatedMinutes: 0,
        coreReasoningChallenge: recommended.reasoningGoal, whyRecommended: recommendation.reason,
      },
      conceptProgress, dueRevisions, recentActivities,
    })
  },

  async submitTrace(payload: TraceSubmissionPayload): Promise<ApiResponse<SubmitTraceResponse>> {
    const result = await tracewiseService.submitAnswer({
      learnerId,
      questionId: payload.questionId,
      answerText: payload.answerText,
      inputMode: payload.inputMethod === 'dictated' ? 'dictated' : 'typed',
      idempotencyKey: `${learnerId}:${payload.questionId}:${payload.submittedAt}`,
      now: new Date(payload.submittedAt),
    })
    const words = payload.answerText.trim().split(/\s+/).filter(Boolean).length
    return wrap({
      submissionId: result.attempt.id,
      status: 'EVALUATED',
      receivedAt: result.attempt.submittedAt,
      summary: { questionId: result.attempt.questionId, wordCount: words, characterCount: result.attempt.answerText.length, inputMethod: payload.inputMethod },
      note: 'Your answer was evaluated and saved in this browser.',
      evaluation: {
        status: result.evaluation.status,
        source: result.evaluation.source,
        evidence: result.evaluation.evidence,
        explanation: result.evaluation.explanation,
        correctiveExplanation: result.evaluation.corrective_explanation,
        clarificationQuestion: result.evaluation.clarification_question,
      },
    })
  },

  async getTeacherCohortMetrics(): Promise<ApiResponse<TeacherCohortMetric>> {
    // Detailed cohort UI is a separate simulated dataset until its view contract
    // is reconciled with the engine's actual aggregate contract.
    return wrap(DEMO_TEACHER_METRIC, true)
  },

  async getTeacherAnalytics(): Promise<ApiResponse<TeacherAnalyticsData>> {
    return wrap(TEACHER_ANALYTICS_FIXTURE, true)
  },

  async getEngineTeacherAnalytics(): Promise<ApiResponse<TeacherAggregate>> {
    return wrap(await tracewiseService.getTeacherAnalytics())
  },

  async getRevisionQueue(): Promise<ApiResponse<RevisionQueueFixture>> {
    const now = new Date()
    const [queue, questions] = await Promise.all([tracewiseService.getRevisionQueue(learnerId, now), tracewiseService.getDiagnosticQuestions()])
    return wrap({ fixtureVersion: 'engine-v1', fixtureNotice: 'Revision tasks generated by the local Tracewise learning engine.', items: [...queue.due, ...queue.upcoming, ...queue.completed].map((task) => mapRevision(task, now, questions)) })
  },

  async completeRevision(item: RevisionItem): Promise<ApiResponse<RevisionItem>> {
    const task = await tracewiseService.completeRevision(learnerId, item.id, new Date())
    const questions = await tracewiseService.getDiagnosticQuestions()
    return wrap(mapRevision(task, new Date(), questions))
  },

  async reopenRevision(item: RevisionItem): Promise<ApiResponse<RevisionItem>> {
    const task = await tracewiseService.reopenRevision(learnerId, item.id)
    const questions = await tracewiseService.getDiagnosticQuestions()
    return wrap(mapRevision(task, new Date(), questions))
  },

  async runReplay(operations: Parameters<typeof tracewiseService.runReplay>[0]) {
    return tracewiseService.runReplay(operations)
  },
}
