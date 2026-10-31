import { describe, expect, test } from 'vitest'
import { ConceptSchema, QuestionSchema } from '../contracts/index.js'
import { concepts, misconceptions, questions } from './index.js'

const count = <T>(values: T[]) => new Set(values).size
const conceptIds = new Set(concepts.map((concept) => concept.id))
const misconceptionCodes = new Set(misconceptions.map((misconception) => misconception.code))

const hasCycle = () => {
  const visiting = new Set<string>()
  const visited = new Set<string>()
  const visit = (id: string): boolean => {
    if (visiting.has(id)) return true
    if (visited.has(id)) return false
    visiting.add(id)
    for (const prerequisite of concepts.find((concept) => concept.id === id)?.prerequisites ?? []) {
      if (visit(prerequisite.conceptId)) return true
    }
    visiting.delete(id)
    visited.add(id)
    return false
  }
  return concepts.some((concept) => visit(concept.id))
}

describe('syllabus data', () => {
  test('validates every concept and question', () => {
    expect(concepts.every((concept) => ConceptSchema.safeParse(concept).success)).toBe(true)
    expect(questions.every((question) => QuestionSchema.safeParse(question).success)).toBe(true)
  })

  test('uses unique ids and valid prerequisite graph', () => {
    expect(count(concepts.map((concept) => concept.id))).toBe(concepts.length)
    expect(count(questions.map((question) => question.id))).toBe(questions.length)
    expect(concepts.every((concept) => concept.prerequisites.every((edge) => conceptIds.has(edge.conceptId)))).toBe(true)
    expect(hasCycle()).toBe(false)
  })

  test('has exactly six diagnostic concepts and questions', () => {
    const diagnostics = concepts.filter((concept) => concept.diagnostic)
    const diagnosticQuestions = questions.filter((question) => question.id.startsWith('diag_'))
    expect(diagnostics).toHaveLength(6)
    expect(diagnosticQuestions).toHaveLength(6)
    expect(diagnosticQuestions.every((question) => question.conceptIds.some((id) => diagnostics.some((concept) => concept.id === id)))).toBe(true)
  })

  test('references only library misconception codes and valid mcq answers', () => {
    expect(concepts.every((concept) => concept.misconceptionCodes.every((code) => misconceptionCodes.has(code)))).toBe(true)
    expect(questions.every((question) => Object.values(question.misconceptionMap).every((code) => misconceptionCodes.has(code)))).toBe(true)
    expect(questions.filter((question) => question.type === 'mcq').every((question) => question.options?.includes(question.answerKey as string))).toBe(true)
  })

  test('covers every concept and includes replay and transfer questions', () => {
    expect(concepts.every((concept) => questions.filter((question) => question.conceptIds.includes(concept.id)).length >= 2)).toBe(true)
    expect(questions.filter((question) => question.supportsReplay).length).toBeGreaterThanOrEqual(2)
    expect(questions.filter((question) => question.isTransfer).length).toBeGreaterThanOrEqual(2)
  })
})
