import type { EvaluationResult, OperationProposal, Question } from '../contracts/index.js'
import { misconceptions } from '../data/misconceptions.js'
import { compareTraces, correctInsertAtHead, diagnoseTrace, runReplay } from '../simulator/index.js'
import { finalizeEvaluation } from './guard.js'
import { addImplicitOperations } from './parser.js'
import type { ReplaySetup } from './rules.js'

export interface ReplayEvaluation { evaluation: EvaluationResult; proposal: OperationProposal; trace?: ReturnType<typeof runReplay>; correctTrace?: ReturnType<typeof runReplay> }
const base = (question: Question, status: EvaluationResult['status'], source: EvaluationResult['source'], fields: Partial<EvaluationResult> = {}): EvaluationResult => ({ status, concept_id: question.conceptIds[0], misconception_code: null, evidence: [], confidence_band: status === 'correct' ? 'high' : status === 'partial' ? 'medium' : 'low', explanation: '', corrective_explanation: '', follow_up_question_id: null, clarification_question: null, source, ...fields })
const followUp = (question: Question, status: EvaluationResult['status']) => status === 'correct' && !question.isTransfer ? 'linked_lists_stack_push_transfer' : status === 'incorrect' ? 'linked_lists_stack_push_transfer' : null

export function evaluateReplayProposal(question: Question, proposal: OperationProposal, setup: ReplaySetup, answerText: string, reasoningText?: string, source: EvaluationResult['source'] = 'rule', note = ''): ReplayEvaluation {
  if (proposal.status !== 'identified') return { proposal, evaluation: finalizeEvaluation(base(question, proposal.status, source, { explanation: `The pointer steps need clarification.${note}`, clarification_question: proposal.clarification_question }), answerText, reasoningText) }
  const prepared = addImplicitOperations(proposal, setup)
  const trace = runReplay(prepared.operations, setup.initial); const correctTrace = runReplay(correctInsertAtHead(setup.newNode), setup.initial)
  if (trace.error) return { proposal: prepared, trace, correctTrace, evaluation: finalizeEvaluation(base(question, 'uncertain', source, { explanation: `The proposed steps could not be simulated.${note}`, clarification_question: 'Please clarify the pointer operations.' }), answerText, reasoningText) }
  const diagnosis = diagnoseTrace(trace, setup.newNode); const comparison = compareTraces(trace, correctTrace)
  const correct = JSON.stringify(trace.final_list) === JSON.stringify([setup.newNode, ...setup.initial.list])
  if (correct) return { proposal: prepared, trace, correctTrace, evaluation: finalizeEvaluation(base(question, 'correct', source, { explanation: `The simulated outcome is correct.${note}`, evidence: prepared.operations.filter((op) => !op.source_text.startsWith('implicit:')).map((op) => op.source_text), follow_up_question_id: followUp(question, 'correct') }), answerText, reasoningText) }
  if (diagnosis.code) {
    const correction = misconceptions.find((item) => item.code === diagnosis.code)?.correction ?? ''
    return { proposal: prepared, trace, correctTrace, evaluation: finalizeEvaluation(base(question, 'incorrect', source, { misconception_code: diagnosis.code, evidence: prepared.operations.filter((op) => (op.op === 'set_head' || op.op === 'set_next') && !op.source_text.startsWith('implicit:')).map((op) => op.source_text), explanation: `${diagnosis.explanation} ${comparison.explanation}${note}`, corrective_explanation: correction, follow_up_question_id: followUp(question, 'incorrect') }), answerText, reasoningText) }
  }
  return { proposal: prepared, trace, correctTrace, evaluation: finalizeEvaluation(base(question, 'uncertain', source, { explanation: `${diagnosis.explanation}${note}`, clarification_question: 'Please clarify the pointer operation order.' }), answerText, reasoningText) }
}
