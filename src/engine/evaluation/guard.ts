import { EvaluationResultSchema, type EvaluationResult } from '../contracts/index.js'

export function finalizeEvaluation(evaluation: EvaluationResult, answerText: string, reasoningText?: string): EvaluationResult {
  const source = `${answerText}\n${reasoningText ?? ''}`
  let result: EvaluationResult = { ...evaluation, evidence: evaluation.evidence.filter((quote) => source.includes(quote)) }
  if (result.status === 'uncertain' || result.status === 'insufficient_answer') result = { ...result, misconception_code: null, evidence: [] }
  else if (result.misconception_code && result.evidence.length === 0) result = { ...result, misconception_code: null }
  return EvaluationResultSchema.parse(result)
}
