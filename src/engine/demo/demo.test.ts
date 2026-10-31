import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { TeacherAggregateSchema } from '../contracts/index.js'
import { evaluateWithRules } from '../evaluation/evaluator.js'
import { questions } from '../data/questions.js'
import { createTracewiseService } from '../service/index.js'
import { aggregateClass } from './analytics.js'
import { SIMULATED_CLASS } from './classData.js'
import { DEMO_SAMPLES } from './samples.js'

describe('simulated teacher analytics', () => {
  it('has 24 deterministic diagnostic-only learners', () => { expect(SIMULATED_CLASS).toHaveLength(24); expect(SIMULATED_CLASS).toEqual(SIMULATED_CLASS); expect(SIMULATED_CLASS.every((learner) => Object.keys(learner.mastery).every((id) => ['arrays', 'pointers', 'structures', 'linked_lists', 'stacks', 'queues'].includes(id)))).toBe(true) })
  it('produces a schema-valid simulated aggregate with sorted misconceptions', () => { const aggregate = aggregateClass(SIMULATED_CLASS); expect(TeacherAggregateSchema.parse(aggregate).dataSource).toBe('simulated'); expect(aggregate.topMisconceptions).toEqual([...aggregate.topMisconceptions].sort((a, b) => b.count - a.count || a.code.localeCompare(b.code))) })
  it('flags learners with a documented attention reason and has a weakest outline target', () => { const aggregate = aggregateClass(SIMULATED_CLASS); expect(aggregate.learnersNeedingAttention.length).toBeGreaterThan(0); expect(aggregate.learnersNeedingAttention.every((item) => item.reason.length > 0)).toBe(true); const weakest = [...aggregate.conceptMastery].sort((a, b) => a.average - b.average)[0]; expect(aggregate.reteachOutline[0]).toContain(weakest.conceptId) })
  it('uses real questions in the reteach outline and works through the service', async () => { const aggregate = aggregateClass(SIMULATED_CLASS); expect(questions.some((question) => aggregate.reteachOutline.join(' ').includes(question.id))).toBe(true); expect((await createTracewiseService().getTeacherAnalytics()).learnerCount).toBe(24) })
  it('strictly matches the teacher aggregate fixture', () => { const fixture = JSON.parse(readFileSync(new URL('../../../fixtures/teacher-aggregate.json', import.meta.url), 'utf8')); expect(aggregateClass(SIMULATED_CLASS)).toEqual(fixture) })
  it('keeps demo sample expectations aligned with the rule evaluator', () => { const question = questions.find((item) => item.id === 'diag_linked_lists_head_insert')!; for (const sample of DEMO_SAMPLES) expect(evaluateWithRules({ question, answerText: sample.text }).evaluation.status).toBe(sample.expected) })
})
