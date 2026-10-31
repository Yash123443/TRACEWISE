import { describe, expect, test } from 'vitest'
import type { Concept, MasteryState, Question, RevisionTask } from '../contracts/index.js'
import { pickReviewQuestion, scheduleReview, splitRevisionQueue } from './scheduler.js'
import { selectNextQuestion } from './selector.js'

const now = new Date('2026-10-31T10:00:00.000Z')
const concept = (id: string, prerequisites: Concept['prerequisites'] = []): Concept => ({ id, name: id, description: '', prerequisites, misconceptionCodes: [], diagnostic: false })
const question = (id: string, conceptIds: string[], difficulty: Question['difficulty'], isTransfer = false): Question => ({ id, conceptIds, type: 'explain', prompt: '', answerKey: '', difficulty, misconceptionMap: {}, isTransfer, supportsReplay: false })
const state = (conceptId: string, mastery: number | null, attempts = 1): MasteryState => ({ conceptId, status: mastery === null ? 'not_assessed' : 'developing', mastery, attempts, lastUpdated: null })

describe('revision scheduler', () => {
  test('correct answers advance the 1/3/7/14 day ladder and cap at fourteen', () => {
    expect([ -1, 0, 1, 2, 3, 4 ].map((previousStage) => scheduleReview({ conceptId: 'arrays', evaluationStatus: 'correct', previousStage, hasMisconception: false, questionId: 'q', now })?.stage)).toEqual([0, 1, 2, 3, 3, 3])
    expect(scheduleReview({ conceptId: 'arrays', evaluationStatus: 'correct', previousStage: 2, hasMisconception: false, questionId: 'q', now })?.task.dueDate).toBe(new Date(now.getTime() + 14 * 86400000).toISOString())
  })
  test('incorrect is due today and uncertain does not schedule', () => {
    expect(scheduleReview({ conceptId: 'pointers', conceptName: 'Pointers', evaluationStatus: 'incorrect', questionId: 'q', now, hasMisconception: true })?.task).toMatchObject({ status: 'due', priority: 'high', reason: expect.stringContaining('due today') })
    expect(scheduleReview({ conceptId: 'arrays', evaluationStatus: 'uncertain', questionId: 'q', now, hasMisconception: false })).toBeNull()
  })
  test('splits due from upcoming and excludes done tasks', () => {
    const tasks = [
      { id: '1', conceptId: 'a', questionId: 'q', dueDate: now.toISOString(), priority: 'low', reason: '', status: 'due' },
      { id: '2', conceptId: 'b', questionId: 'q', dueDate: new Date(now.getTime() + 1000).toISOString(), priority: 'low', reason: '', status: 'scheduled' },
      { id: '3', conceptId: 'c', questionId: 'q', dueDate: now.toISOString(), priority: 'low', reason: '', status: 'done' },
    ] as RevisionTask[]
    expect(splitRevisionQueue(tasks, now)).toEqual({ due: [tasks[0]], upcoming: [tasks[1]] })
  })
  test('review picker prefers a different question and transfer for active misconception', () => {
    const qs = [question('q1', ['a'], 'intro'), question('q2', ['a'], 'standard'), question('q3', ['a'], 'standard', true)]
    expect(pickReviewQuestion({ conceptId: 'a', lastQuestionId: 'q1', masteryState: state('a', 0.6), questions: qs, misconceptionActive: true })?.id).toBe('q3')
  })
})

describe('question selector', () => {
  const concepts = [concept('arrays'), concept('pointers', [{ conceptId: 'arrays', type: 'requires' }]), concept('linked_lists', [{ conceptId: 'pointers', type: 'requires' }])]
  const questions = [question('a-intro', ['arrays'], 'intro'), question('p-intro', ['pointers'], 'intro'), question('p-standard', ['pointers'], 'standard'), question('ll-intro', ['linked_lists'], 'intro'), question('ll-standard', ['linked_lists'], 'standard')]
  test('selects weakest concept and includes a reason', () => {
    const selected = selectNextQuestion({ concepts, questions, mastery: { arrays: state('arrays', 0.8), pointers: state('pointers', 0.2), linked_lists: state('linked_lists', 0.7) }, revisionTasks: [], recentQuestionIds: [], misconceptions: [], now })
    expect(selected?.question.conceptIds).toContain('pointers')
    expect(selected?.reason.length).toBeGreaterThan(0)
  })
  test('due concept is boosted above an otherwise weaker assessed concept', () => {
    const selected = selectNextQuestion({ concepts: [concept('arrays'), concept('linked_lists')], questions: [question('a-intro', ['arrays'], 'intro'), question('ll-intro', ['linked_lists'], 'intro')], mastery: { arrays: state('arrays', 0.1), linked_lists: state('linked_lists', 0.4) }, revisionTasks: [{ id: 'd', conceptId: 'linked_lists', questionId: 'll-intro', dueDate: now.toISOString(), priority: 1, reason: '', status: 'due' }], recentQuestionIds: [], misconceptions: [], now })
    expect(selected?.question.conceptIds).toContain('linked_lists')
  })
  test('redirects to weak required prerequisite and applies its difficulty', () => {
    const selected = selectNextQuestion({ concepts: [concept('linked_lists', [{ conceptId: 'arrays', type: 'requires' }]), concept('arrays')], questions: [question('a-intro', ['arrays'], 'intro'), question('ll-intro', ['linked_lists'], 'intro')], mastery: { arrays: state('arrays', 0.3), linked_lists: state('linked_lists', 0.1) }, revisionTasks: [], recentQuestionIds: [], misconceptions: [], now })
    expect(selected?.question.conceptIds).toContain('arrays')
    expect(selected?.difficulty).toBe('intro')
    expect(selected?.reason).toContain('prerequisite')
  })
  test('never repeats the most recent question and matches difficulty', () => {
    const selected = selectNextQuestion({ concepts: [concept('pointers')], questions: [question('p-intro', ['pointers'], 'intro'), question('p-standard', ['pointers'], 'standard'), question('p-challenge', ['pointers'], 'challenge')], mastery: { pointers: state('pointers', 0.8) }, revisionTasks: [], recentQuestionIds: ['p-intro', 'p-standard'], misconceptions: [], now })
    expect(selected?.question.id).not.toBe('p-standard')
    expect(selected?.difficulty).toBe('challenge')
  })
  test('is deterministic across identical inputs', () => {
    const input = { concepts, questions, mastery: {}, revisionTasks: [], recentQuestionIds: [], misconceptions: [], now }
    expect(selectNextQuestion(input)).toEqual(selectNextQuestion(input))
  })
})
