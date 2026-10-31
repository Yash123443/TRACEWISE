import { useEffect, useRef, useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import type { LearningQuestion, TraceSubmissionPayload } from '../../types/tracewise';
import type { SubmitTraceResponse } from '../../services/apiService';
import { TracewiseApi } from '../../services/apiService';

const statusLabel = (status: string) => {
  switch (status) {
    case 'correct': return 'Correct';
    case 'incorrect': return 'Not quite';
    case 'partial': return 'Partly right';
    case 'uncertain':
    case 'insufficient_answer': return 'Not clear yet';
    default: return 'Not clear yet';
  }
};

const readableDate = (date: string) => {
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? 'date unavailable' : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(parsed);
};

export function SubmissionReviewModal({ isOpen, onClose, question, draftText, onUpdateDraftText, onSubmitConfirm, isSubmitting, submissionResult, submissionError, onResetSubmission, inputMethod, confidence, onResultDone }: {
  isOpen: boolean; onClose: () => void; question: LearningQuestion; draftText: string; onUpdateDraftText: (text: string) => void;
  onSubmitConfirm: (payload: TraceSubmissionPayload) => Promise<SubmitTraceResponse | null>; isSubmitting: boolean; submissionResult: SubmitTraceResponse | null;
  submissionError?: string | null; onResetSubmission: () => void; inputMethod: 'typed' | 'dictated'; confidence?: number; onResultDone: (questionId?: string) => void
}) {
  const [text, setText] = useState(draftText);
  const [nextTitle, setNextTitle] = useState<string | null>(null);
  const [revisionLabel, setRevisionLabel] = useState<string | null>(null);
  const [submitStarted, setSubmitStarted] = useState(false);
  const submitLock = useRef(false);
  useEffect(() => setText(draftText), [draftText]);
  useEffect(() => {
    let active = true;
    setNextTitle(null);
    setRevisionLabel(null);
    if (submissionResult?.nextRecommendation) {
      void TracewiseApi.getQuestion(submissionResult.nextRecommendation.questionId).then((next) => {
        if (active) setNextTitle(next.title);
      });
    }
    if (submissionResult?.revisionTask) {
      const task = submissionResult.revisionTask;
      void TracewiseApi.demoNow().then((now) => {
        if (!active) return;
        const due = new Date(task.dueDate);
        const days = Math.max(0, Math.ceil((due.getTime() - now.getTime()) / 86_400_000));
        setRevisionLabel(`Review ${TracewiseApi.conceptName(task.conceptId)} on ${readableDate(task.dueDate)} (in ${days} ${days === 1 ? 'day' : 'days'})`);
      });
    }
    return () => { active = false; };
  }, [submissionResult]);

  const submit = async () => {
    if (submitLock.current || submitStarted || isSubmitting || !text.trim()) return;
    submitLock.current = true;
    setSubmitStarted(true);
    onUpdateDraftText(text);
    try {
      await onSubmitConfirm({ questionId: question.id, studentId: 'demo_learner', answerText: text, inputMethod, timeSpentSeconds: 0, invariantsMentioned: [], submittedAt: new Date().toISOString(), ...(confidence === undefined ? {} : { confidence }) } as TraceSubmissionPayload);
    } finally {
      submitLock.current = false;
      setSubmitStarted(false);
    }
  };

  const close = () => { if (!isSubmitting) onClose(); };
  const isUnclear = submissionResult ? ['uncertain', 'insufficient_answer'].includes(submissionResult.evaluation.status) : false;
  const misconception = submissionResult && !isUnclear ? TracewiseApi.misconceptionName(submissionResult.evaluation.misconception_code) : null;
  const footer = submissionResult ? (
    <Button variant="primary" onClick={() => {
      if (isUnclear) {
        onResetSubmission();
        close();
        return;
      }
      const nextId = submissionResult.nextRecommendation?.questionId;
      onResetSubmission();
      close();
      onResultDone(nextId);
    }} disabled={isSubmitting}>
      {isUnclear ? 'Try again' : submissionResult.nextRecommendation ? 'Next question' : 'Done'}
    </Button>
  ) : (
    <div className="flex w-full justify-between">
      <Button variant="outline" onClick={close} disabled={isSubmitting}>Back</Button>
      <Button variant="primary" onClick={() => void submit()} disabled={isSubmitting || submitStarted || !text.trim()} isLoading={isSubmitting || submitStarted}>Submit answer</Button>
    </div>
  );

  return <Modal isOpen={isOpen} onClose={close} title="Review your answer" subtitle={question.title} maxWidth="xl" footer={footer} dismissible={!submissionResult}>
    {submissionResult ? (
      <div className="space-y-4 text-sm">
        <div><span className="sr-only">Status: </span><span className="inline-flex rounded-full border border-stone-300 bg-stone-100 px-3 py-1 font-semibold text-stone-900">{statusLabel(submissionResult.evaluation.status)}</span></div>
        {submissionResult.evaluation.evidence.map((item, index) => <p key={index} className="rounded border-l-2 border-stone-400 bg-stone-50 px-3 py-2 italic">“{item.trim()}”</p>)}
        <p>{submissionResult.evaluation.explanation}</p>
        {!isUnclear && submissionResult.evaluation.corrective_explanation && <p>{submissionResult.evaluation.corrective_explanation}</p>}
        {isUnclear ? <p>Clarification: {submissionResult.evaluation.clarification_question ?? 'Please restate your reasoning.'}</p> : misconception && <p><span className="font-medium">Misconception:</span> {misconception}</p>}
        <p><span className="font-medium">Source:</span> {submissionResult.evaluation.source === 'llm' ? 'Checked by AI, verified by simulator' : submissionResult.evaluation.source === 'rule' ? 'Checked by rules' : 'Sample fixture'}</p>
        <p><span className="font-medium">Why did mastery change?</span> {submissionResult.historyEntry.reason}</p>
        <div className="space-y-1">
          <p><span className="font-medium">Next recommendation:</span> {submissionResult.nextRecommendation ? (nextTitle ?? 'Loading question…') : 'None'}</p>
          {submissionResult.nextRecommendation && <p className="text-stone-600">{submissionResult.nextRecommendation.reason}</p>}
          <p><span className="font-medium">Revision task:</span> {revisionLabel ?? (submissionResult.revisionTask ? 'Loading review date…' : 'None')}</p>
        </div>
      </div>
    ) : (
      <div className="space-y-3">
        <p className="text-sm text-stone-600">{question.title} · {question.difficulty}</p>
        <p className="font-medium">Your answer</p>
        {question.options?.includes(draftText) ? (
          <p className="rounded border bg-stone-50 p-3">{draftText}</p>
        ) : (
          <textarea id="review-answer" aria-label="Your answer" className="min-h-48 w-full rounded border p-3" value={text} onChange={(event) => setText(event.target.value)} disabled={isSubmitting || submitStarted} />
        )}
        {submissionError && <p className="text-sm text-rose-800" role="alert">{submissionError}</p>}
      </div>
    )}
  </Modal>;
}
