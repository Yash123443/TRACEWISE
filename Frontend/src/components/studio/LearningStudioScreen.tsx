import React, { useEffect, useRef, useState } from 'react';
import type { LearningQuestion, TraceSubmissionPayload } from '../../types/tracewise';
import { QuestionCard } from './QuestionCard';
import { ExpressionEditor } from './ExpressionEditor';
import { SubmissionReviewModal } from './SubmissionReviewModal';
import { useSpeechToText } from '../../hooks/useSpeechToText';
import { TracewiseApi } from '../../services/apiService';
import type { SubmitTraceResponse } from '../../services/apiService';
import { ErrorDisplay } from '../common/StateSwitcher';
import type { UiSimulationState } from '../common/StateSwitcher';
import { Button } from '../common/Button';
import { Layers } from 'lucide-react';
import { DEMO_SAMPLES } from '@engine/demo/samples';
import type { Trace } from '@engine/contracts';

interface LearningStudioScreenProps {
  initialQuestion?: LearningQuestion;
  questionBank?: LearningQuestion[];
  uiState: UiSimulationState;
  onRetry: () => void;
  onOpenWorkbench?: () => void;
  onTrace?: (trace: Trace) => void;
}

export const LearningStudioScreen: React.FC<LearningStudioScreenProps> = ({
  initialQuestion,
  questionBank,
  uiState,
  onRetry,
  onOpenWorkbench,
  onTrace,
}) => {
  const [currentQuestion, setCurrentQuestion] = useState<LearningQuestion>(initialQuestion!);
  const [expressionText, setExpressionText] = useState<string>(initialQuestion?.defaultStarterTrace ?? '');
  const [dictated, setDictated] = useState(false);
  const [confidence, setConfidence] = useState<number | undefined>();
  const submissionKey = useRef<{ text: string; key: string } | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<SubmitTraceResponse | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  useEffect(() => {
    if (!initialQuestion) return;
    setCurrentQuestion(initialQuestion);
    setExpressionText(initialQuestion.defaultStarterTrace);
    setSubmissionResult(null);
    submissionKey.current = null;
  }, [initialQuestion]);

  // Speech to text integration
  const {
    isListening,
    isSupported,
    errorMessage,
    interimText,
    toggleListening,
    clearError,
  } = useSpeechToText({
    onTranscriptChange: (text, isFinal) => {
      if (isFinal) {
        setExpressionText((prev) => {
          const space = prev.length > 0 && !prev.endsWith('\n') && !prev.endsWith(' ') ? ' ' : '';
          return prev + space + text;
        });
      }
    },
  });

  const handleSelectQuestion = (q: LearningQuestion) => {
    setCurrentQuestion(q);
    setExpressionText(q.defaultStarterTrace);
    setSubmissionResult(null);
    submissionKey.current = null;
  };

  const handleResetStarter = () => {
    setExpressionText(currentQuestion.defaultStarterTrace);
  };

  const handleSubmitConfirm = async (payload: TraceSubmissionPayload) => {
    setIsSubmitting(true);
    setSubmissionError(null);
    try {
      const text = payload.answerText;
      if (submissionKey.current?.text !== text) submissionKey.current = { text, key: crypto.randomUUID() };
      const res = await TracewiseApi.submitTrace({ ...payload, inputMethod: dictated ? 'dictated' : 'typed', confidence, idempotencyKey: submissionKey.current.key });
      setSubmissionResult(res.data);
      submissionKey.current = null;
      if (res.data.trace) onTrace?.(res.data.trace);
      return res.data;
    } catch (e) {
      console.error(e);
      setSubmissionError(e instanceof Error ? e.message : 'Could not save this answer. Your text is still here; please retry.');
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  if (uiState === 'loading') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
        <div className="h-8 bg-stone-200 rounded w-1/4 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 h-[600px] bg-stone-200 rounded-xl" />
          <div className="lg:col-span-7 h-[600px] bg-stone-200 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!initialQuestion) return <main className="p-8">There are no unanswered diagnostic questions or recommendations available.</main>;

  if (uiState === 'error') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ErrorDisplay
          message="Could not load the problem trace schema from the local test runner."
          onRetry={onRetry}
        />
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Studio Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900">
            Algorithmic Reasoning Studio
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Articulate the mathematical invariants, state transitions, and edge proofs behind your algorithm.
          </p>
        </div>

        {/* Status Pill & Workbench Action */}
        <div className="flex items-center gap-3">
          {onOpenWorkbench && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onOpenWorkbench}
              leftIcon={<Layers className="w-3.5 h-3.5 text-stone-700" />}
              className="text-xs"
            >
              Interactive Memory Workbench
            </Button>
          )}

          <div className="hidden sm:flex items-center gap-2 text-xs font-mono bg-stone-100 border border-stone-200 px-3 py-1.5 rounded-lg shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span className="text-stone-700">Studio Mode: Typing & Dictation</span>
          </div>
        </div>
      </div>

      {/* Main Two-Panel Workbench Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch min-h-[640px]">
        {/* Left Column: Problem Specification (5 cols) */}
        <section className="lg:col-span-5 h-full" aria-label="Problem Specification">
          <QuestionCard
            question={currentQuestion}
            questionsList={questionBank ?? []}
            onSelectQuestion={handleSelectQuestion}
          />
          {currentQuestion.recommendationReason && <p className="mt-2 text-sm text-stone-600">Recommendation reason: {currentQuestion.recommendationReason}</p>}
        </section>

        {/* Right Column: Reasoning Expression Field (7 cols) */}
        <section className="lg:col-span-7 h-full" aria-label="Student Expression Field">
          <ExpressionEditor
            value={expressionText}
            onChange={(val) => setExpressionText(val)}
            isListening={isListening}
            isSupported={isSupported}
            errorMessage={errorMessage}
            interimText={interimText}
            onToggleListening={toggleListening}
            onClearError={clearError}
            onResetStarter={handleResetStarter}
            onSubmitReview={() => setIsReviewModalOpen(true)}
            invariantsToCheck={currentQuestion.keyInvariantsToAddress}
          />
        </section>
      </div>

      <div className="flex flex-wrap items-center gap-4 rounded-lg border bg-white p-3 text-sm">
        <label className="flex items-center gap-2"><input type="checkbox" checked={dictated} onChange={(e) => setDictated(e.target.checked)} /> I dictated this with Wispr Flow (external dictation; no SDK)</label>
        <label>Confidence (optional): <select value={confidence ?? ''} onChange={(e) => setConfidence(e.target.value ? Number(e.target.value) : undefined)}><option value="">Not provided</option>{[1,2,3,4,5].map((n)=><option key={n} value={n}>{n}</option>)}</select></label>
        <label>Try a sample: <select value="" onChange={(e) => { const sample=DEMO_SAMPLES.find((item)=>item.id===e.target.value); if(sample) setExpressionText(sample.text) }}><option value="">Select sample response</option>{DEMO_SAMPLES.map((sample)=><option key={sample.id} value={sample.id}>{sample.label} — Sample response, not from a real student</option>)}</select></label>
      </div>

      {/* Review & Edit Modal */}
      <SubmissionReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        question={currentQuestion}
        draftText={expressionText}
        onUpdateDraftText={(text) => setExpressionText(text)}
        onSubmitConfirm={handleSubmitConfirm}
        isSubmitting={isSubmitting}
        submissionResult={submissionResult}
        submissionError={submissionError}
        onResetSubmission={() => setSubmissionResult(null)}
        inputMethod={dictated ? 'dictated' : 'typed'}
        confidence={confidence}
        onResultDone={onRetry}
      />
    </main>
  );
};
