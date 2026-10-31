import type { MasteryState, Question, RevisionTask } from '../contracts/index.js'

export const ladder = [1, 3, 7, 14] as const
export type ReviewPriority = 'low' | 'medium' | 'high'
export type ScheduledRevision = Omit<RevisionTask, 'id' | 'priority'> & { priority: ReviewPriority }
export interface ScheduleReviewInput { conceptId: string; conceptName?: string; evaluationStatus: QuestionStatus; previousStage?: number; hasMisconception: boolean; questionId: string; now: Date }
type QuestionStatus = 'correct' | 'incorrect' | 'partial' | 'uncertain' | 'insufficient_answer'

export function scheduleReview({ conceptId, conceptName = conceptId.replaceAll('_', ' '), evaluationStatus, previousStage = -1, hasMisconception, questionId, now }: ScheduleReviewInput): { stage: number; task: ScheduledRevision } | null {
  if (evaluationStatus === 'uncertain' || evaluationStatus === 'insufficient_answer') return null
  let stage: number
  let days: number
  let priority: ReviewPriority
  let reason: string
  if (evaluationStatus === 'incorrect') {
    stage = 0; days = 0; priority = 'high'; reason = `${conceptName} was answered incorrectly, so review is due today.`
  } else if (evaluationStatus === 'partial') {
    stage = Math.max(previousStage, 0); days = ladder[Math.min(stage, 3)]; priority = 'medium'; reason = `${conceptName} was answered partially, so another review is scheduled.`
  } else {
    stage = Math.min(previousStage + 1, 3); days = ladder[stage]; priority = hasMisconception ? 'medium' : 'low'; reason = `${conceptName} was answered correctly, so review is scheduled in ${days} days.`
  }
  const dueDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString()
  return { stage, task: { conceptId, questionId, dueDate, priority, reason, status: days === 0 ? 'due' : 'scheduled' } }
}

export function splitRevisionQueue(tasks: RevisionTask[], now: Date): { due: RevisionTask[]; upcoming: RevisionTask[] } {
  const due: RevisionTask[] = []
  const upcoming: RevisionTask[] = []
  for (const task of tasks) {
    if (task.status === 'done') continue
    if (new Date(task.dueDate).getTime() <= now.getTime()) due.push(task)
    else upcoming.push(task)
  }
  return { due, upcoming }
}

export interface PickReviewQuestionInput { conceptId: string; lastQuestionId?: string; masteryState: MasteryState; questions: Question[]; misconceptionActive: boolean }
const desiredDifficulty = (state: MasteryState): Question['difficulty'] => state.status === 'not_assessed' || (state.mastery ?? 0) < 0.4 ? 'intro' : (state.mastery ?? 0) < 0.7 ? 'standard' : 'challenge'

export function pickReviewQuestion({ conceptId, lastQuestionId, masteryState, questions, misconceptionActive }: PickReviewQuestionInput): Question | undefined {
  const candidates = questions.filter((question) => question.conceptIds.includes(conceptId))
  if (candidates.length === 0) return undefined
  const otherQuestions = candidates.filter((question) => question.id !== lastQuestionId)
  const pool = otherQuestions.length > 0 ? otherQuestions : candidates
  const preferred = misconceptionActive && pool.some((question) => question.isTransfer) ? pool.filter((question) => question.isTransfer) : pool
  const target = desiredDifficulty(masteryState)
  const rank: Record<Question['difficulty'], number> = { intro: 0, standard: 1, challenge: 2 }
  return [...preferred].sort((a, b) => Math.abs(rank[a.difficulty] - rank[target]) - Math.abs(rank[b.difficulty] - rank[target]) || a.id.localeCompare(b.id))[0]
}
