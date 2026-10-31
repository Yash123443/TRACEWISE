import type { EvaluationResult, Question } from '../contracts/index.js'
import { finalizeEvaluation } from './guard.js'
import { evaluateWithRules, type RuleEvaluation } from './evaluator.js'
import { evaluateReplayProposal } from './pipeline.js'
import { replaySetup } from './rules.js'
import type { AiInterpreter } from './ai.js'

export function createHybridEvaluator({ interpreter, rules = evaluateWithRules }: { interpreter: AiInterpreter; rules?: typeof evaluateWithRules }) {
  return async (question: Question, answerText: string, reasoningText?: string, _inputMode?: 'typed' | 'dictated', _confidence?: number): Promise<RuleEvaluation> => {
    const setup = replaySetup[question.id]
    if (!question.supportsReplay || !setup) return rules({ question, answerText, reasoningText })
    const interpreted = await interpreter({ answerText, setup })
    if (!interpreted.ok) { const fallback = rules({ question, answerText, reasoningText }); const evaluation: EvaluationResult = finalizeEvaluation({ ...fallback.evaluation, explanation: `${fallback.evaluation.explanation} AI interpretation was unavailable (${interpreted.reason}), so the rule-based evaluator was used.`, source: 'rule' }, answerText, reasoningText); return { ...fallback, evaluation } }
    if (interpreted.proposal.status !== 'identified') {
      const status = interpreted.proposal.status
      return { proposal: interpreted.proposal, evaluation: finalizeEvaluation({ status, concept_id: question.conceptIds[0], misconception_code: null, evidence: [], confidence_band: 'low', explanation: 'The pointer steps need clarification.', corrective_explanation: '', follow_up_question_id: null, clarification_question: interpreted.proposal.clarification_question, source: 'llm' }, answerText, reasoningText) }
    }
    return evaluateReplayProposal(question, interpreted.proposal, setup, answerText, reasoningText, 'llm', ` The steps were interpreted by AI (${interpreted.model}, ${interpreted.promptVersion}) and verified by a deterministic simulator.`)
  }
}
