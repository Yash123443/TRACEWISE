import type { EvaluationResult, Question } from '../contracts/index.js'
import { finalizeEvaluation } from './guard.js'
import { evaluateWithRules, type RuleEvaluation } from './evaluator.js'
import { evaluateReplayProposal } from './pipeline.js'
import { replaySetup } from './rules.js'
import type { AiAnswerEvaluator, AiInterpreter } from './ai.js'

export function createHybridEvaluator({ interpreter, answerEvaluator, rules = evaluateWithRules }: { interpreter: AiInterpreter; answerEvaluator: AiAnswerEvaluator; rules?: typeof evaluateWithRules }) {
  return async (question: Question, answerText: string, reasoningText?: string, _inputMode?: 'typed' | 'dictated', _confidence?: number): Promise<RuleEvaluation> => {
    const setup = replaySetup[question.id]
    if (question.supportsReplay && setup) {
      const interpreted = await interpreter({ answerText, setup })
      if (!interpreted.ok) { const fallback = rules({ question, answerText, reasoningText }); const evaluation: EvaluationResult = finalizeEvaluation({ ...fallback.evaluation, explanation: `${fallback.evaluation.explanation} AI interpretation was unavailable (${interpreted.reason}), so the rule-based evaluator was used.`, source: 'rule' }, answerText, reasoningText); return { ...fallback, evaluation } }
      if (interpreted.proposal.status !== 'identified') {
        const status = interpreted.proposal.status
        return { proposal: interpreted.proposal, evaluation: finalizeEvaluation({ status, concept_id: question.conceptIds[0], misconception_code: null, evidence: [], confidence_band: 'low', explanation: 'The pointer steps need clarification.', corrective_explanation: '', follow_up_question_id: null, clarification_question: interpreted.proposal.clarification_question, source: 'llm' }, answerText, reasoningText) }
      }
      return evaluateReplayProposal(question, interpreted.proposal, setup, answerText, reasoningText, 'llm', ` The steps were interpreted by AI (${interpreted.model}, ${interpreted.promptVersion}) and verified by a deterministic simulator.`)
    }
    if (question.type !== 'mcq') {
      const assessed = await answerEvaluator({ answerText, question })
      if (assessed.ok) return { evaluation: finalizeEvaluation(assessed.evaluation, answerText, reasoningText) }
      const fallback = rules({ question, answerText, reasoningText })
      return { ...fallback, evaluation: finalizeEvaluation({ ...fallback.evaluation, explanation: `${fallback.evaluation.explanation} AI assessment was unavailable (${assessed.reason}), so the rule-based evaluator was used.`, source: 'rule' }, answerText, reasoningText) }
    }
    return rules({ question, answerText, reasoningText })
  }
}
