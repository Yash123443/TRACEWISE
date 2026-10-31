import { z } from 'zod'

export const ConceptSchema = z.object({
  id: z.string(), name: z.string(), description: z.string(),
  prerequisites: z.array(z.object({ conceptId: z.string(), type: z.enum(['requires', 'supports']) })),
  misconceptionCodes: z.array(z.string()), diagnostic: z.boolean(),
})
export type Concept = z.infer<typeof ConceptSchema>

export const QuestionSchema = z.object({
  id: z.string(), conceptIds: z.array(z.string()), type: z.enum(['mcq', 'trace', 'explain']),
  prompt: z.string(), options: z.array(z.string()).optional(), answerKey: z.unknown(),
  difficulty: z.enum(['intro', 'standard', 'challenge']), misconceptionMap: z.record(z.string(), z.string()),
  isTransfer: z.boolean(), supportsReplay: z.boolean(),
})
export type Question = z.infer<typeof QuestionSchema>

export const EvaluationResultSchema = z.object({
  status: z.enum(['correct', 'incorrect', 'partial', 'uncertain', 'insufficient_answer']),
  concept_id: z.string(), misconception_code: z.string().nullable(), evidence: z.array(z.string()),
  confidence_band: z.enum(['high', 'medium', 'low']), explanation: z.string(), corrective_explanation: z.string(),
  follow_up_question_id: z.string().nullable(), clarification_question: z.string().nullable(),
  source: z.enum(['llm', 'rule', 'fixture']),
})
export type EvaluationResult = z.infer<typeof EvaluationResultSchema>

const OperationSchema = z.discriminatedUnion('op', [
  z.object({ op: z.literal('allocate'), node: z.string(), source_text: z.string() }),
  z.object({ op: z.literal('capture'), name: z.string(), from: z.string(), source_text: z.string() }),
  z.object({ op: z.literal('set_next'), node: z.string(), target: z.string(), source_text: z.string() }),
  z.object({ op: z.literal('set_head'), target: z.string(), source_text: z.string() }),
])
export type Operation = z.infer<typeof OperationSchema>
export const OperationProposalSchema = z.object({
  status: z.enum(['identified', 'uncertain', 'insufficient_answer']), operations: z.array(OperationSchema), clarification_question: z.string().nullable(),
})
export type OperationProposal = z.infer<typeof OperationProposalSchema>

export const TraceFrameSchema = z.object({
  index: z.number().int().nonnegative(), operation: OperationSchema, nodes: z.record(z.string(), z.object({ next: z.string().nullable() })),
  head: z.string().nullable(), reachable: z.array(z.string()), unreachable: z.array(z.string()), note: z.string(),
})
export type TraceFrame = z.infer<typeof TraceFrameSchema>
export const TraceSchema = z.object({
  steps: z.array(TraceFrameSchema), final_head: z.string().nullable(), final_list: z.array(z.string()), unreachable_nodes: z.array(z.string()), error: z.string().optional(),
})
export type Trace = z.infer<typeof TraceSchema>

export const MasteryStateSchema = z.object({
  conceptId: z.string(), status: z.enum(['not_assessed', 'developing', 'due', 'strong']), mastery: z.number().min(0).max(1).nullable(), attempts: z.number().int().nonnegative(), lastUpdated: z.string().datetime().nullable(),
}).refine((v) => (v.status === 'not_assessed') === (v.mastery === null), 'not_assessed requires null mastery; assessed states require a score')
export type MasteryState = z.infer<typeof MasteryStateSchema>
export const MasteryHistoryEntrySchema = z.object({ id: z.string(), attemptId: z.string(), conceptId: z.string(), questionId: z.string(), before: MasteryStateSchema, after: MasteryStateSchema, reason: z.string(), modelVersion: z.literal('evidence-v1'), timestamp: z.string().datetime() })
export type MasteryHistoryEntry = z.infer<typeof MasteryHistoryEntrySchema>

export const AttemptSchema = z.object({
  id: z.string(), idempotencyKey: z.string(), learnerId: z.string(), questionId: z.string(), answerText: z.string(), reasoningText: z.string().optional(),
  inputMode: z.enum(['typed', 'dictated']), confidence: z.number().int().min(1).max(5).optional(), submittedAt: z.string().datetime(),
  evaluation: EvaluationResultSchema, evaluationSource: z.enum(['llm', 'rule', 'fixture']),
})
export type Attempt = z.infer<typeof AttemptSchema>
export const StudentMisconceptionSchema = z.object({ code: z.string(), status: z.enum(['suspected', 'recurring', 'needs_verification', 'corrected']), count: z.number().int().nonnegative(), evidenceAttemptIds: z.array(z.string()) })
export type StudentMisconception = z.infer<typeof StudentMisconceptionSchema>
export const RevisionTaskSchema = z.object({ id: z.string(), conceptId: z.string(), questionId: z.string(), dueDate: z.string().datetime(), priority: z.number(), reason: z.string(), status: z.enum(['scheduled', 'due', 'done']) })
export type RevisionTask = z.infer<typeof RevisionTaskSchema>
export const TeacherAggregateSchema = z.object({
  dataSource: z.enum(['simulated', 'live']), learnerCount: z.number().int().nonnegative(),
  conceptMastery: z.array(z.object({ conceptId: z.string(), average: z.number().min(0).max(1), distribution: z.record(z.string(), z.number().nonnegative()) })),
  topMisconceptions: z.array(z.object({ code: z.string(), count: z.number().int().nonnegative() })),
  learnersNeedingAttention: z.array(z.object({ learnerId: z.string(), reason: z.string() })), attentionThreshold: z.number(), reteachOutline: z.array(z.string()),
})
export type TeacherAggregate = z.infer<typeof TeacherAggregateSchema>
