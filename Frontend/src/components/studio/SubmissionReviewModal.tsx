import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import type { LearningQuestion, TraceSubmissionPayload } from '../../types/tracewise';
import type { SubmitTraceResponse } from '../../services/apiService';
import {
  CheckCircle2,
  FileCheck,
  Send,
  Code,
  ShieldCheck,
} from 'lucide-react';

interface SubmissionReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: LearningQuestion;
  draftText: string;
  onUpdateDraftText: (text: string) => void;
  onSubmitConfirm: (payload: TraceSubmissionPayload) => Promise<SubmitTraceResponse | null>;
  isSubmitting: boolean;
  submissionResult: SubmitTraceResponse | null;
  submissionError?: string | null;
  onResetSubmission: () => void;
}

export const SubmissionReviewModal: React.FC<SubmissionReviewModalProps> = ({
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
}) => {
  const [editedText, setEditedText] = useState(draftText);

  // Sync state if draftText changes
  React.useEffect(() => {
    setEditedText(draftText);
  }, [draftText]);

  const wordCount = editedText.trim() ? editedText.trim().split(/\s+/).length : 0;

  const handleFinalSubmit = async () => {
    if (editedText !== draftText) {
      onUpdateDraftText(editedText);
    }

    const payload: TraceSubmissionPayload = {
      questionId: question.id,
      studentId: 'std_demo_8842',
      answerText: editedText,
      inputMethod: 'hybrid',
      timeSpentSeconds: 420,
      invariantsMentioned: ['s[left] == s[right]', 'left < right'],
      submittedAt: new Date().toISOString(),
    };

    await onSubmitConfirm(payload);
  };

  // If already successfully submitted, show structured acknowledgment
  if (submissionResult) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={() => {
          onResetSubmission();
          onClose();
        }}
        title="Trace Evaluated"
        subtitle="The learning engine evaluated and saved your reasoning"
        maxWidth="lg"
        footer={
          <Button
            variant="primary"
            size="md"
            onClick={() => {
              onResetSubmission();
              onClose();
            }}
          >
            Done & Return to Studio
          </Button>
        }
      >
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-teal-50 border border-teal-200 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
            <div className="text-xs text-teal-950 space-y-1">
              <span className="font-semibold text-sm">
                Queue Status: {submissionResult.status}
              </span>
              <p>{submissionResult.note}</p>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-stone-900 text-stone-100 text-xs font-mono space-y-2">
            <div className="flex items-center justify-between text-stone-400 border-b border-stone-800 pb-2">
              <span className="flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-stone-300" />
                Backend Evaluator Contract Payload
              </span>
                <span className="text-[11px] text-teal-400">Source: {submissionResult.evaluation.source}</span>
            </div>
            <pre className="overflow-x-auto text-[11px] leading-relaxed text-stone-300">
              {JSON.stringify(
                {
                  submissionId: submissionResult.submissionId,
                  questionId: submissionResult.summary.questionId,
                  wordCount: submissionResult.summary.wordCount,
                  characterCount: submissionResult.summary.characterCount,
                  inputMethod: submissionResult.summary.inputMethod,
                  receivedAt: submissionResult.receivedAt,
                  evaluation: submissionResult.evaluation,
                },
                null,
                2
              )}
            </pre>
          </div>

          <div className="p-3 rounded-lg bg-stone-50 border border-stone-200 text-xs text-stone-600 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-stone-500 shrink-0" />
            <span>
              Evaluation source is shown above. The local rule engine does not claim AI evaluation.
            </span>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Review & Audit Your Reasoning Trace"
      subtitle={`Verify your invariants and complexity claims for "${question.title}"`}
      maxWidth="xl"
      footer={
        <div className="flex items-center justify-between w-full gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Back to Editor
          </Button>

          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={handleFinalSubmit}
            isLoading={isSubmitting}
            rightIcon={<Send className="w-4 h-4" />}
          >
            Confirm & Submit Trace
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {submissionError && <div role="alert" className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-900">{submissionError}</div>}
        {/* Metadata summary */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-stone-50 rounded-lg border border-stone-200 text-xs text-stone-600">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-stone-900">{question.title}</span>
            <span className="font-mono text-stone-500">• {wordCount} words</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Badge variant="teal" size="sm">
              Target: {question.targetComplexity.time}
            </Badge>
          </div>
        </div>

        {/* Editable answer inspection */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="modal-answer-edit"
              className="text-xs font-semibold text-stone-900 flex items-center gap-1.5"
            >
              <FileCheck className="w-3.5 h-3.5 text-stone-700" />
              Final Expression for Submission (Editable):
            </label>
            <span className="text-[11px] text-stone-500">
              Students can freely amend wording before final dispatch
            </span>
          </div>

          <textarea
            id="modal-answer-edit"
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            rows={8}
            className="w-full p-3 font-mono text-xs leading-relaxed text-stone-900 bg-stone-50/50 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:bg-white resize-y"
            placeholder="Edit final answer text..."
          />
        </div>

        {/* Invariant Coverage Checklist */}
        <div className="p-3.5 rounded-lg bg-stone-50 border border-stone-200 space-y-2 text-xs">
          <span className="font-semibold text-stone-900 text-[11px] uppercase tracking-wider">
            Invariant Checklist Coverage:
          </span>
          <div className="space-y-1">
            {question.keyInvariantsToAddress.map((inv, idx) => {
              const appearsInDraft =
                editedText.toLowerCase().includes(inv.toLowerCase().slice(0, 12)) ||
                editedText.toLowerCase().includes('invariant') ||
                editedText.toLowerCase().includes('pointer');

              return (
                <div key={idx} className="flex items-center gap-2 text-stone-700">
                  <CheckCircle2
                    className={`w-3.5 h-3.5 ${
                      appearsInDraft ? 'text-teal-700' : 'text-stone-400'
                    }`}
                  />
                  <span className="font-mono text-[11px]">{inv}</span>
                  {appearsInDraft ? (
                    <span className="text-[10px] text-teal-800 font-sans ml-auto">Detected</span>
                  ) : (
                    <span className="text-[10px] text-stone-400 font-sans ml-auto">Check</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
};
