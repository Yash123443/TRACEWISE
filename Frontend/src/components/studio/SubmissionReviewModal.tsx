import { useEffect, useRef, useState } from 'react'
import { Modal } from '../common/Modal'
import { Button } from '../common/Button'
import { Badge } from '../common/Badge'
import type { LearningQuestion, TraceSubmissionPayload } from '../../types/tracewise'
import type { SubmitTraceResponse } from '../../services/apiService'
import { TracewiseApi } from '../../services/apiService'
import {
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Cpu,
  Layers,
  ArrowRight,
  Calendar,
  Quote,
  ShieldCheck,
} from 'lucide-react'

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'correct':
      return (
        <Badge variant="teal" size="md" icon={<CheckCircle2 className="w-4 h-4 text-teal-700" />}>
          Correct Reasoning
        </Badge>
      )
    case 'incorrect':
      return (
        <Badge variant="red" size="md" icon={<AlertCircle className="w-4 h-4 text-rose-700" />}>
          Conceptual Flaw Detected
        </Badge>
      )
    case 'partial':
      return (
        <Badge variant="amber" size="md" icon={<AlertCircle className="w-4 h-4 text-amber-700" />}>
          Partially Correct
        </Badge>
      )
    case 'uncertain':
    case 'insufficient_answer':
    default:
      return (
        <Badge variant="gray" size="md" icon={<HelpCircle className="w-4 h-4 text-stone-600" />}>
          Clarification Needed
        </Badge>
      )
  }
}

const readableDate = (date: string) => {
  const parsed = new Date(date)
  return Number.isNaN(parsed.getTime())
    ? 'date unavailable'
    : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(parsed)
}

export function SubmissionReviewModal({
  isOpen,
  onClose,
  question,
  draftText,
  onUpdateDraftText,
  onSubmitConfirm,
  isSubmitting,
  submissionResult,
  submissionError,
  onResetSubmission,
  inputMethod,
  confidence,
  onResultDone,
  onViewMemoryReplay,
  hasReplayTrace,
}: {
  isOpen: boolean
  onClose: () => void
  question: LearningQuestion
  draftText: string
  onUpdateDraftText: (text: string) => void
  onSubmitConfirm: (payload: TraceSubmissionPayload) => Promise<SubmitTraceResponse | null>
  isSubmitting: boolean
  submissionResult: SubmitTraceResponse | null
  submissionError?: string | null
  onResetSubmission: () => void
  inputMethod: 'typed' | 'dictated'
  confidence?: number
  onResultDone: (questionId?: string) => void
  onViewMemoryReplay?: () => void
  hasReplayTrace?: boolean
}) {
  const [text, setText] = useState(draftText)
  const [nextTitle, setNextTitle] = useState<string | null>(null)
  const [revisionLabel, setRevisionLabel] = useState<string | null>(null)
  const [submitStarted, setSubmitStarted] = useState(false)
  const submitLock = useRef(false)

  useEffect(() => setText(draftText), [draftText])

  useEffect(() => {
    let active = true
    setNextTitle(null)
    setRevisionLabel(null)
    if (submissionResult?.nextRecommendation) {
      void TracewiseApi.getQuestion(submissionResult.nextRecommendation.questionId).then((next) => {
        if (active) setNextTitle(next.title)
      })
    }
    if (submissionResult?.revisionTask) {
      const task = submissionResult.revisionTask
      void TracewiseApi.demoNow().then((now) => {
        if (!active) return
        const due = new Date(task.dueDate)
        const days = Math.max(0, Math.ceil((due.getTime() - now.getTime()) / 86_400_000))
        setRevisionLabel(
          `Review ${TracewiseApi.conceptName(task.conceptId)} on ${readableDate(task.dueDate)} (${
            days === 0 ? 'today' : days === 1 ? 'tomorrow' : `in ${days} days`
          })`
        )
      })
    }
    return () => {
      active = false
    }
  }, [submissionResult])

  const submit = async () => {
    if (submitLock.current || submitStarted || isSubmitting || !text.trim()) return
    submitLock.current = true
    setSubmitStarted(true)
    onUpdateDraftText(text)
    try {
      await onSubmitConfirm({
        questionId: question.id,
        studentId: 'demo_learner',
        answerText: text,
        inputMethod,
        timeSpentSeconds: 0,
        invariantsMentioned: [],
        submittedAt: new Date().toISOString(),
        ...(confidence === undefined ? {} : { confidence }),
      } as TraceSubmissionPayload)
    } finally {
      submitLock.current = false
      setSubmitStarted(false)
    }
  }

  const close = () => {
    if (!isSubmitting) onClose()
  }

  const isUnclear = submissionResult
    ? ['uncertain', 'insufficient_answer'].includes(submissionResult.evaluation.status)
    : false
  const misconception =
    submissionResult && !isUnclear
      ? TracewiseApi.misconceptionName(submissionResult.evaluation.misconception_code)
      : null

  const footer = submissionResult ? (
    <div className="flex flex-wrap items-center justify-between w-full gap-3">
      {hasReplayTrace && onViewMemoryReplay ? (
        <Button
          type="button"
          variant="secondary"
          size="md"
          onClick={() => {
            close()
            onViewMemoryReplay()
          }}
          leftIcon={<Layers className="w-4 h-4 text-teal-700" />}
        >
          View Memory Replay
        </Button>
      ) : (
        <div></div>
      )}

      <Button
        variant="primary"
        size="md"
        onClick={() => {
          if (isUnclear) {
            onResetSubmission()
            close()
            return
          }
          const nextId = submissionResult.nextRecommendation?.questionId
          onResetSubmission()
          close()
          onResultDone(nextId)
        }}
        disabled={isSubmitting}
        rightIcon={<ArrowRight className="w-4 h-4" />}
      >
        {isUnclear ? 'Revise Reasoning' : submissionResult.nextRecommendation ? 'Next Question' : 'Done'}
      </Button>
    </div>
  ) : (
    <div className="flex w-full justify-between items-center gap-3">
      <Button variant="outline" size="md" onClick={close} disabled={isSubmitting}>
        Back
      </Button>
      <Button
        variant="primary"
        size="md"
        onClick={() => void submit()}
        disabled={isSubmitting || submitStarted || !text.trim()}
        isLoading={isSubmitting || submitStarted}
        rightIcon={<ArrowRight className="w-4 h-4" />}
      >
        Submit Answer
      </Button>
    </div>
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={close}
      title={submissionResult ? 'Reasoning Evaluation & Diagnostics' : 'Review Before Submitting'}
      subtitle={question.title}
      maxWidth="xl"
      footer={footer}
      dismissible={!submissionResult}
    >
      {submissionResult ? (
        <div className="space-y-4 text-sm animate-in fade-in duration-200">
          {/* Status Banner */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-200">
            <div>{getStatusBadge(submissionResult.evaluation.status)}</div>

            {/* Provenance Pill */}
            <div className="inline-flex items-center gap-1.5 text-xs text-stone-600 bg-stone-100 px-2.5 py-1 rounded-full border border-stone-200 font-mono">
              {submissionResult.evaluation.source === 'llm' ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-teal-700" />
                  <span>AI Interpreted · Simulator Verified</span>
                </>
              ) : submissionResult.evaluation.source === 'rule' ? (
                <>
                  <Cpu className="w-3.5 h-3.5 text-blue-700" />
                  <span>Deterministic Rule Engine</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-stone-600" />
                  <span>Sample Fixture Reference</span>
                </>
              )}
            </div>
          </div>

          {/* Evidence Quotes */}
          {submissionResult.evaluation.evidence.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">
                Extracted Evidence From Your Answer
              </span>
              <div className="space-y-2">
                {submissionResult.evaluation.evidence.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2.5 rounded-lg border-l-4 border-stone-400 bg-stone-50 p-3 text-stone-800 text-xs italic"
                  >
                    <Quote className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                    <span>“{item.trim()}”</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Diagnostic Explanation */}
          <div className="rounded-xl border border-stone-200 bg-white p-4 space-y-2 shadow-2xs">
            <h4 className="font-semibold text-stone-900 text-xs uppercase tracking-wider">
              Diagnostic Assessment
            </h4>
            <p className="text-stone-800 leading-relaxed text-sm">
              {submissionResult.evaluation.explanation}
            </p>

            {!isUnclear && submissionResult.evaluation.corrective_explanation && (
              <p className="text-stone-700 leading-relaxed text-xs pt-2 border-t border-stone-100">
                <span className="font-semibold text-stone-900">Corrective Insight: </span>
                {submissionResult.evaluation.corrective_explanation}
              </p>
            )}

            {isUnclear && (
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900 space-y-1">
                <span className="font-bold flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-amber-700" /> Clarification Question:
                </span>
                <p>{submissionResult.evaluation.clarification_question ?? 'Please restate the exact order of your steps.'}</p>
              </div>
            )}

            {misconception && (
              <div className="pt-2 border-t border-stone-100 text-xs flex items-center gap-2 text-rose-800">
                <span className="font-semibold">Detected Misconception:</span>
                <span className="bg-rose-100 px-2 py-0.5 rounded font-mono font-medium">
                  {misconception}
                </span>
              </div>
            )}
          </div>

          {/* Mastery Change Ledger Reason */}
          <div className="p-3 rounded-lg border border-stone-200 bg-stone-50/70 text-xs space-y-1">
            <span className="font-semibold text-stone-700 block">Why did mastery update?</span>
            <p className="text-stone-600 leading-relaxed">
              {submissionResult.historyEntry.reason}
            </p>
          </div>

          {/* Next Steps & Spaced Revision Scheduled */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
            {/* Next Recommendation */}
            <div className="p-3 rounded-lg border border-stone-200 bg-white space-y-1">
              <span className="font-semibold text-stone-500 uppercase tracking-wider text-[10px] block">
                Next Recommendation
              </span>
              <p className="font-bold text-stone-900 truncate">
                {submissionResult.nextRecommendation ? nextTitle ?? 'Loading question…' : 'Curriculum Complete'}
              </p>
              {submissionResult.nextRecommendation && (
                <p className="text-stone-500 text-[11px] line-clamp-1">
                  {submissionResult.nextRecommendation.reason}
                </p>
              )}
            </div>

            {/* Revision Task */}
            <div className="p-3 rounded-lg border border-stone-200 bg-white space-y-1">
              <span className="font-semibold text-stone-500 uppercase tracking-wider text-[10px] block flex items-center gap-1">
                <Calendar className="w-3 h-3 text-stone-400" /> Spaced Revision Scheduled
              </span>
              <p className="font-bold text-stone-900">
                {revisionLabel ?? (submissionResult.revisionTask ? 'Scheduling review…' : 'None required')}
              </p>
              <p className="text-stone-500 text-[11px]">Calculated by evidence-v1 decay model</p>
            </div>
          </div>
        </div>
      ) : (
        /* Submission Draft Review Form */
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-stone-600 pb-2 border-b border-stone-200">
            <span className="font-medium text-stone-900">{question.title}</span>
            <span className="font-mono bg-stone-100 px-2 py-0.5 rounded text-stone-700">
              {question.difficulty}
            </span>
          </div>

          <div className="space-y-2">
            <label htmlFor="review-answer" className="text-xs font-semibold text-stone-700 block">
              Verify Your Recorded Explanation
            </label>
            {question.options?.includes(draftText) ? (
              <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 font-mono text-sm text-stone-900">
                {draftText}
              </div>
            ) : (
              <textarea
                id="review-answer"
                aria-label="Your answer"
                className="min-h-44 w-full rounded-xl border border-stone-300 p-3.5 font-mono text-sm leading-relaxed text-stone-900 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-400 resize-y"
                value={text}
                onChange={(event) => setText(event.target.value)}
                disabled={isSubmitting || submitStarted}
                placeholder="Edit or review your reasoning before final submission..."
              />
            )}
          </div>

          {submissionError && (
            <div
              className="p-3 rounded-lg border border-rose-200 bg-rose-50 text-xs text-rose-800 flex items-center gap-2"
              role="alert"
            >
              <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
              <span>{submissionError}</span>
            </div>
          )}

          <p className="text-xs text-stone-500 leading-relaxed">
            Your reasoning will be evaluated for invariant preservation. Exact substrings of your answer will be quoted as evidence.
          </p>
        </div>
      )}
    </Modal>
  )
}
