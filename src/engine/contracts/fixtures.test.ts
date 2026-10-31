import { readFileSync } from 'node:fs'
import { describe, expect, test } from 'vitest'
import { EvaluationResultSchema, MasteryHistoryEntrySchema, MasteryStateSchema, RevisionTaskSchema, TeacherAggregateSchema, TraceSchema } from './index.js'

const fixtures = new URL('../../../fixtures/', import.meta.url)
const load = (name: string) => JSON.parse(readFileSync(new URL(name, fixtures), 'utf8')) as unknown

describe('JSON contract fixtures', () => {
  test.each([
    ['evaluation-correct.json', EvaluationResultSchema],
    ['evaluation-incorrect.json', EvaluationResultSchema],
    ['evaluation-uncertain.json', EvaluationResultSchema],
    ['trace-correct.json', TraceSchema],
    ['trace-lost-nodes.json', TraceSchema],
    ['mastery-state.json', MasteryStateSchema],
    ['history-entry.json', MasteryHistoryEntrySchema],
    ['revision-task.json', RevisionTaskSchema],
    ['teacher-aggregate.json', TeacherAggregateSchema],
  ])('%s validates against its schema', (file, schema) => {
    expect(schema.safeParse(load(file)).success).toBe(true)
  })
})
