import type { MasteryState, StudentMisconception } from '../contracts/index.js'

export const CLASS_META = { dataSource: 'simulated' as const, label: 'Simulated class data (generated for demo, not real students)', seed: 314159 }
export interface SimulatedLearner { learnerId: string; mastery: Record<string, MasteryState>; misconceptions: StudentMisconception[] }
const diagnostic = ['arrays', 'pointers', 'structures', 'linked_lists', 'stacks', 'queues']
const base: Record<string, number> = { arrays: 0.78, pointers: 0.43, structures: 0.63, linked_lists: 0.39, stacks: 0.76, queues: 0.61 }
let seed = CLASS_META.seed
const random = () => { seed = (seed * 48271) % 2147483647; return seed / 2147483647 }
const score = (conceptId: string, weak: boolean) => Math.max(0.12, Math.min(0.94, Math.round((base[conceptId] + (random() - 0.5) * 0.24 - (weak ? 0.24 : 0)) * 100) / 100))
const state = (conceptId: string, mastery: number): MasteryState => ({ conceptId, mastery, attempts: 1 + Math.floor(random() * 3), status: mastery >= 0.8 ? 'strong' : 'developing', lastUpdated: '2026-10-31T10:00:00.000Z' })
const misconception = (code: string, index: number): StudentMisconception => ({ code, status: index % 5 === 0 ? 'recurring' : 'suspected', count: index % 5 === 0 ? 2 : 1, evidenceAttemptIds: [`sim_attempt_${index}_${code}`] })
export const SIMULATED_CLASS: SimulatedLearner[] = Array.from({ length: 24 }, (_, index) => {
  const weak = index < 6; const codes = index % 4 === 0 ? ['LL_INSERT_ORDER', 'LL_SELF_LOOP', 'PTR_ADDR_VS_VALUE'] : index % 3 === 0 ? ['LL_INSERT_ORDER'] : index % 5 === 0 ? ['LL_SELF_LOOP', 'STRUCT_DOT_VS_ARROW'] : []
  return { learnerId: `sim_${String(index + 1).padStart(2, '0')}`, mastery: Object.fromEntries(diagnostic.map((conceptId) => [conceptId, state(conceptId, score(conceptId, weak))])), misconceptions: codes.map((code) => misconception(code, index)) }
})
