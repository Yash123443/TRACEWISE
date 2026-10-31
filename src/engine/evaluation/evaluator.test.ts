import { describe, expect, test } from 'vitest'
import { questions } from '../data/questions.js'
import { evaluateWithRules } from './evaluator.js'

const byId = (id: string) => questions.find((question) => question.id === id)!
const evaluate = (id: string, answerText: string) => evaluateWithRules({ question: byId(id), answerText })

describe('rule-based evaluator', () => {
  test('self-consistently evaluates every answer key as correct', () => {
    for (const question of questions) expect(evaluateWithRules({ question, answerText: String(question.answerKey) }).evaluation.status, question.id).toBe('correct')
  })
  test('returns each mapped mcq wrong option with its code', () => {
    for (const question of questions.filter((item) => item.type === 'mcq')) for (const option of question.options ?? []) if (option !== question.answerKey) {
      const result = evaluateWithRules({ question, answerText: option }).evaluation
      expect(result.status).toBe('incorrect')
      expect(result.misconception_code).toBe(question.misconceptionMap[option] ?? null)
    }
  })
  test('returns evidence that is always quoted from submitted text', () => {
    const text = 'I make N the head, then point N’s next to the head'
    const result = evaluate('diag_linked_lists_head_insert', text).evaluation
    expect(result.evidence.every((quote) => text.includes(quote))).toBe(true)
  })
  test('handles ambiguous and self-loop explanations honestly', () => {
    expect(evaluate('diag_linked_lists_head_insert', 'somehow connect the nodes up').evaluation).toMatchObject({ misconception_code: null, evidence: [] })
    expect(evaluate('diag_linked_lists_head_insert', 'I make N the head, then point N\'s next to the head').evaluation.misconception_code).toBe('LL_SELF_LOOP')
  })
  test('distinguishes lost-node and missing-head diagnoses', () => {
    expect(evaluate('diag_linked_lists_head_insert', 'I make the new node the head').evaluation.misconception_code).toBe('LL_INSERT_ORDER')
    expect(evaluate('diag_linked_lists_head_insert', 'point the new node to the head').evaluation.misconception_code).toBe('LL_FORGOT_HEAD_UPDATE')
  })
  test('accepts dictated text and self-correction', () => {
    expect(evaluate('diag_linked_lists_head_insert', 'Um so first I create a new node, uh then I point it to the old head and then I make it the head').evaluation.status).toBe('correct')
    expect(evaluate('diag_linked_lists_head_insert', 'make the new node the head, no wait, first point the new node to the old head and then make it the head').evaluation.status).toBe('correct')
  })
  test('requires clarification for explicit relative ordering and retains source text', () => {
    const text = 'set head to N after pointing N to head'
    const result = evaluate('diag_linked_lists_head_insert', text).evaluation
    expect(result).toMatchObject({ status: 'uncertain', misconception_code: null, evidence: [], source: 'rule' })
    expect(text).toBe('set head to N after pointing N to head')
  })
})
