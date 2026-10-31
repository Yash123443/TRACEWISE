import { useEffect, useState } from 'react'
import { Modal } from '../common/Modal'
import { Button } from '../common/Button'
import type { LearningQuestion, TraceSubmissionPayload } from '../../types/tracewise'
import type { SubmitTraceResponse } from '../../services/apiService'
import { TracewiseApi } from '../../services/apiService'

export function SubmissionReviewModal({ isOpen, onClose, question, draftText, onUpdateDraftText, onSubmitConfirm, isSubmitting, submissionResult, submissionError, onResetSubmission, inputMethod, confidence, onResultDone }: {
  isOpen: boolean; onClose: () => void; question: LearningQuestion; draftText: string; onUpdateDraftText: (text: string) => void;
  onSubmitConfirm: (payload: TraceSubmissionPayload) => Promise<SubmitTraceResponse | null>; isSubmitting: boolean; submissionResult: SubmitTraceResponse | null;
  submissionError?: string | null; onResetSubmission: () => void; inputMethod: 'typed' | 'dictated'; confidence?: number; onResultDone: () => void
}) {
  const [text, setText] = useState(draftText)
  useEffect(() => setText(draftText), [draftText])
  const submit = async () => {
    onUpdateDraftText(text)
    await onSubmitConfirm({ questionId: question.id, studentId: 'demo_learner', answerText: text, inputMethod, timeSpentSeconds: 0, invariantsMentioned: [], submittedAt: new Date().toISOString(), ...(confidence === undefined ? {} : { confidence }) } as TraceSubmissionPayload)
  }
  return <Modal isOpen={isOpen} onClose={onClose} title="Review your answer" subtitle={question.title} maxWidth="xl" footer={<div className="flex justify-between"><Button variant="outline" onClick={onClose} disabled={isSubmitting}>Back</Button><Button variant="primary" onClick={()=>void submit()} isLoading={isSubmitting}>Submit answer</Button></div>}>
    {submissionResult ? <div className="space-y-3 text-sm"><h3 className="font-semibold">{submissionResult.evaluation.status}</h3>{submissionResult.evaluation.evidence.map((item,i)=><p key={i}>“{item}”</p>)}<p>{submissionResult.evaluation.explanation}</p>{!['uncertain','insufficient_answer'].includes(submissionResult.evaluation.status) && <p>{submissionResult.evaluation.corrective_explanation}</p>}{['uncertain','insufficient_answer'].includes(submissionResult.evaluation.status) ? <p>Clarification: {submissionResult.evaluation.clarification_question ?? 'Please restate your reasoning.'} · No diagnosis shown.</p> : <p>Misconception: {TracewiseApi.misconceptionName(submissionResult.evaluation.misconception_code) ?? 'None'}</p>}<p>Source: {submissionResult.evaluation.source === 'llm' ? 'AI interpretation, verified by deterministic simulator' : submissionResult.evaluation.source === 'rule' ? 'Rule-based evaluation' : 'Sample fixture'}</p><p>Why did mastery change? {submissionResult.historyEntry.before.attempts === 0 ? 'Starting estimate. ' : ''}{submissionResult.historyEntry.reason}</p><p>Next recommendation: {submissionResult.nextRecommendation?.questionId ?? 'None'} · Revision task: {submissionResult.revisionTask?.id ?? 'None'}</p><Button variant="primary" onClick={()=>{onResetSubmission();onClose();onResultDone()}}>Done</Button></div> : <div className="space-y-3"><p>{question.title} · {question.difficulty}</p><textarea className="min-h-48 w-full rounded border p-3" value={text} onChange={(e)=>setText(e.target.value)} /><p className="text-sm text-rose-800" role="alert">{submissionError}</p></div>}
  </Modal>
}
