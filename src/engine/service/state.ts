import { z } from 'zod'
import type { Attempt, MasteryHistoryEntry, MasteryState, RevisionTask, StudentMisconception } from '../contracts/index.js'
import type { SubmitAnswerResult } from './types.js'
import { concepts } from '../data/index.js'

export interface LearnerState {
  learnerId: string; mastery: Record<string, MasteryState>; attempts: Attempt[]; history: MasteryHistoryEntry[]
  misconceptions: Record<string, StudentMisconception>; revisionTasks: RevisionTask[]; conceptStages: Record<string, number>; results: Record<string, SubmitAnswerResult>
}

// History intentionally permits the documented first-attempt 0.5 starting estimate.
const StateSchema = z.object({ learnerId: z.string(), mastery: z.record(z.string(), z.unknown()), attempts: z.array(z.unknown()), history: z.array(z.unknown()), misconceptions: z.record(z.string(), z.unknown()), revisionTasks: z.array(z.unknown()), conceptStages: z.record(z.string(), z.number()), results: z.record(z.string(), z.unknown()) })
export const freshState = (learnerId: string): LearnerState => ({
  learnerId, mastery: Object.fromEntries(concepts.map((concept) => [concept.id, { conceptId: concept.id, status: 'not_assessed', mastery: null, attempts: 0, lastUpdated: null }])), attempts: [], history: [], misconceptions: {}, revisionTasks: [], conceptStages: {}, results: {},
})
export function parseState(value: string | null, learnerId: string): LearnerState {
  if (!value) return freshState(learnerId)
  try { const state = StateSchema.parse(JSON.parse(value)) as LearnerState; return state.learnerId === learnerId ? state : freshState(learnerId) } catch { return freshState(learnerId) }
}
