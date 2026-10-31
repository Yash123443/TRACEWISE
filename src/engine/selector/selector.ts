import type { Concept, MasteryState, Question, RevisionTask, StudentMisconception } from '../contracts/index.js'
import { pickReviewQuestion } from './scheduler.js'

export interface SelectNextQuestionInput { concepts: Concept[]; questions: Question[]; mastery: Record<string, MasteryState>; revisionTasks: RevisionTask[]; recentQuestionIds: string[]; misconceptions: StudentMisconception[]; now: Date }
export interface SelectedQuestion { question: Question; reason: string; difficulty: Question['difficulty'] }
const level = (state: MasteryState): Question['difficulty'] => state.status === 'not_assessed' || (state.mastery ?? 0) < 0.4 ? 'intro' : (state.mastery ?? 0) < 0.7 ? 'standard' : 'challenge'

export function selectNextQuestion({ concepts, questions, mastery, revisionTasks, recentQuestionIds, misconceptions, now }: SelectNextQuestionInput): SelectedQuestion | null {
  const recentIndex = new Map(recentQuestionIds.map((id, index) => [id, index]))
  const dueIds = new Set(revisionTasks.filter((task) => task.status !== 'done' && new Date(task.dueDate).getTime() <= now.getTime()).map((task) => task.conceptId))
  const activeByConcept = new Set(misconceptions.filter((item) => item.status === 'suspected' || item.status === 'recurring').map((item) => item.code))
  const ordered = concepts.map((concept, syllabusIndex) => {
    const state = mastery[concept.id] ?? { conceptId: concept.id, status: 'not_assessed' as const, mastery: null, attempts: 0, lastUpdated: null }
    const score = (1 - (state.status === 'not_assessed' ? 0.5 : state.mastery ?? 0.5)) + (state.status === 'not_assessed' ? 0.2 : 0) + (dueIds.has(concept.id) ? 0.5 : 0) + (concept.misconceptionCodes.some((code) => activeByConcept.has(code)) ? 0.3 : 0)
    return { concept, state, score, syllabusIndex }
  }).sort((a, b) => b.score - a.score || a.syllabusIndex - b.syllabusIndex)
  for (const candidate of ordered) {
    let target = candidate
    let redirectedFrom: string | undefined
    const weakPrerequisite = candidate.concept.prerequisites.find((edge) => edge.type === 'requires' && mastery[edge.conceptId] && mastery[edge.conceptId].status !== 'not_assessed' && (mastery[edge.conceptId].mastery ?? 0) < 0.5)
    if (weakPrerequisite) {
      const prereq = ordered.find((item) => item.concept.id === weakPrerequisite.conceptId)
      if (prereq) { target = prereq; redirectedFrom = candidate.concept.name }
    }
    const activeCodes = target.concept.misconceptionCodes.filter((code) => activeByConcept.has(code))
    const available = questions.filter((question) => question.conceptIds.includes(target.concept.id))
    const masteryState = target.state
    const picked = pickReviewQuestion({ conceptId: target.concept.id, lastQuestionId: recentQuestionIds.at(-1), masteryState, questions: available, misconceptionActive: activeCodes.length > 0 })
    if (!picked) continue
    const unseen = available.filter((question) => !recentIndex.has(question.id))
    const pool = unseen.length > 0 ? unseen : available.filter((question) => question.id !== recentQuestionIds.at(-1))
    const ideal = level(masteryState)
    const rank: Record<Question['difficulty'], number> = { intro: 0, standard: 1, challenge: 2 }
    const question = pool.length > 0
      ? [...pool].sort((a, b) => Math.abs(rank[a.difficulty] - rank[ideal]) - Math.abs(rank[b.difficulty] - rank[ideal]) || (recentIndex.get(a.id) ?? -1) - (recentIndex.get(b.id) ?? -1) || a.id.localeCompare(b.id))[0]
      : picked
    const reason = redirectedFrom
      ? `${target.concept.name} is a weak required prerequisite for ${redirectedFrom}.`
      : dueIds.has(target.concept.id)
        ? `${target.concept.name} is due for review today.`
        : `${target.concept.name} has the highest current practice priority.`
    return { question, reason, difficulty: question.difficulty }
  }
  return null
}
