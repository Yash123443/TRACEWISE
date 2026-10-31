import React, { useEffect, useState } from 'react';
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
import { DEMO_LEARNING_QUESTIONS } from '../../mock/demoData';

interface LearningStudioScreenProps {
  initialQuestion?: LearningQuestion;
  questionBank?: LearningQuestion[];
  uiState: UiSimulationState;
  onRetry: () => void;
  onOpenWorkbench?: () => void;
}

export const LearningStudioScreen: React.FC<LearningStudioScreenProps> = ({
  initialQuestion,
  questionBank,
  uiState,
  onRetry,
  onOpenWorkbench,
}) => {
  const [currentQuestion, setCurrentQuestion] = useState<LearningQuestion>(
    initialQuestion || DEMO_LEARNING_QUESTIONS[0]
  );
  const [expressionText, setExpressionText] = useState<string>(
    initialQuestion?.defaultStarterTrace || DEMO_LEARNING_QUESTIONS[0].defaultStarterTrace
  );
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<SubmitTraceResponse | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  useEffect(() => {
    if (!initialQuestion) return;
    setCurrentQuestion(initialQuestion);
    setExpressionText(initialQuestion.defaultStarterTrace);
    setSubmissionResult(null);
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
  };

  const handleResetStarter = () => {
    setExpressionText(currentQuestion.defaultStarterTrace);
  };

  const handleSubmitConfirm = async (payload: TraceSubmissionPayload) => {
    setIsSubmitting(true);
    setSubmissionError(null);
    try {
      const res = await TracewiseApi.submitTrace(payload);
      setSubmissionResult(res.data);
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
            questionsList={questionBank?.length ? questionBank : DEMO_LEARNING_QUESTIONS}
            onSelectQuestion={handleSelectQuestion}
          />
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
      />
    </main>
  );
};
