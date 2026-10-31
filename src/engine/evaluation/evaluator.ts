import type { EvaluationResult, Question } from '../contracts/index.js'
import { questions } from '../data/questions.js'
import { runReplay } from '../simulator/index.js'
import { finalizeEvaluation } from './guard.js'
import { firstOriginalMatch, normalizeForMatch } from './normalize.js'
import { parseInsertExplanation } from './parser.js'
import { evaluateReplayProposal } from './pipeline.js'
import { replaySetup, rules } from './rules.js'

export interface RuleEvaluation { evaluation: EvaluationResult; proposal?: ReturnType<typeof parseInsertExplanation>; trace?: ReturnType<typeof runReplay>; correctTrace?: ReturnType<typeof runReplay> }
const base = (question: Question, status: EvaluationResult['status'], fields: Partial<EvaluationResult> = {}): EvaluationResult => ({ status, concept_id: question.conceptIds[0], misconception_code: null, evidence: [], confidence_band: status === 'correct' ? 'high' : status === 'partial' ? 'medium' : 'low', explanation: '', corrective_explanation: '', follow_up_question_id: null, clarification_question: null, source: 'rule', ...fields })
const followUp = (question: Question, status: EvaluationResult['status']) => {
  const replay = questions.filter((item) => item.supportsReplay && item.id !== question.id)
  if (status === 'incorrect') return replay.find((item) => item.isTransfer)?.id ?? replay[0]?.id ?? null
  if (status === 'correct' && !question.isTransfer) return replay.find((item) => item.isTransfer)?.id ?? null
  return null
}

export function evaluateWithRules({ question, answerText, reasoningText }: { question: Question; answerText: string; reasoningText?: string; confidence?: number }): RuleEvaluation {
  const finish = (evaluation: EvaluationResult) => finalizeEvaluation(evaluation, answerText, reasoningText)
  if (!answerText.trim()) return { evaluation: finish(base(question, 'insufficient_answer', { explanation: 'Please provide an answer.', clarification_question: 'What is your answer?' })) }
  if (question.type === 'mcq') {
    const answer = normalizeForMatch(answerText)
    const option = question.options?.find((item) => normalizeForMatch(item) === answer)
    if (!option) return { evaluation: finish(base(question, 'uncertain', { explanation: 'The answer does not match an option.', clarification_question: 'Please choose one listed option.' })) }
    if (option === question.answerKey) return { evaluation: finish(base(question, 'correct', { evidence: [answerText], explanation: 'The selected option is correct.', follow_up_question_id: followUp(question, 'correct') })) }
    return { evaluation: finish(base(question, 'incorrect', { misconception_code: question.misconceptionMap[option] ?? null, evidence: [answerText], explanation: 'The selected option is not correct.', follow_up_question_id: followUp(question, 'incorrect') })) }
  }
  const setup = replaySetup[question.id]
  if (setup) {
    const proposal = parseInsertExplanation(answerText, setup)
    return evaluateReplayProposal(question, proposal, setup, answerText, reasoningText)
  }
  if (question.type === 'explain' && answerText.trim().split(/\s+/).length < 4) return { evaluation: finish(base(question, 'insufficient_answer', { explanation: 'The answer is too short to assess.', clarification_question: 'Please explain your reasoning.' })) }
  const rule = rules[question.id]
  const matched = rule?.required.map((group) => group.map((pattern) => firstOriginalMatch(answerText, pattern)).find(Boolean)) ?? []
  if (rule?.wrong) {
    const wrong = rule.wrong.map((item) => ({ ...item, quote: firstOriginalMatch(answerText, item.pattern) })).find((item) => item.quote)
    if (wrong) return { evaluation: finish(base(question, 'incorrect', { misconception_code: wrong.code, evidence: [wrong.quote ?? ''], explanation: wrong.note, follow_up_question_id: followUp(question, 'incorrect') })) }
  }
  if (matched.length && matched.every(Boolean)) return { evaluation: finish(base(question, 'correct', { evidence: matched.filter(Boolean) as string[], explanation: 'The answer matches the rule.', follow_up_question_id: followUp(question, 'correct') })) }
  if (matched.some(Boolean)) return { evaluation: finish(base(question, 'partial', { evidence: matched.filter(Boolean) as string[], explanation: 'Part of the answer matches the rule.' })) }
  return { evaluation: finish(base(question, 'uncertain', { explanation: 'The answer does not provide enough matching detail.', clarification_question: 'Please explain the key step or result.' })) }
}
