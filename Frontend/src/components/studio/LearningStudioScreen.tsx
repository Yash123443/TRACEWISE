import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import type { Trace } from '@engine/contracts';
import { DEMO_SAMPLES } from '@engine/demo/samples';

const LINKED_LIST_REPLAY_QUESTION = 'diag_linked_lists_head_insert';

interface LearningStudioScreenProps {
  initialQuestion?: LearningQuestion;
  questionBank?: LearningQuestion[];
  uiState: UiSimulationState;
  onRetry: () => void;
  onOpenWorkbench?: () => void;
  onTrace?: (trace: Trace) => void;
  onQuestionChange?: (questionId: string) => void;
  onViewMemoryReplay?: () => void;
  hasReplayTrace?: boolean;
}

export const LearningStudioScreen: React.FC<LearningStudioScreenProps> = ({
  initialQuestion, questionBank, uiState, onRetry, onOpenWorkbench, onTrace, onQuestionChange, onViewMemoryReplay, hasReplayTrace,
}) => {
  const [currentQuestion, setCurrentQuestion] = useState<LearningQuestion>(initialQuestion!);
  const [expressionText, setExpressionText] = useState(initialQuestion?.defaultStarterTrace ?? '');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [dictated, setDictated] = useState(false);
  const [confidence, setConfidence] = useState<number | undefined>();
  const submissionKey = useRef<{ text: string; key: string } | null>(null);
  const submitLock = useRef(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<SubmitTraceResponse | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const hasOptions = Boolean(currentQuestion?.options?.length);
  const answerText = hasOptions ? selectedOption ?? '' : expressionText;

  useEffect(() => {
    if (!initialQuestion) return;
    setCurrentQuestion(initialQuestion);
    setExpressionText(initialQuestion.defaultStarterTrace);
    setSelectedOption(null);
    setDictated(false);
    setConfidence(undefined);
    setSubmissionResult(null);
    submissionKey.current = null;
  }, [initialQuestion]);

  const handleTranscript = useCallback((text: string, isFinal: boolean) => {
    if (isFinal) {
      setExpressionText((previous) => {
        const separator = previous.length > 0 && !previous.endsWith('\n') && !previous.endsWith(' ') ? ' ' : '';
        return previous + separator + text;
      });
      setDictated(true);
    }
  }, []);
  const { isListening, isSupported, errorMessage, interimText, toggleListening, clearError } = useSpeechToText({ onTranscriptChange: handleTranscript });

  const handleSelectQuestion = (question: LearningQuestion) => {
    setCurrentQuestion(question);
    onQuestionChange?.(question.id);
    setExpressionText(question.defaultStarterTrace);
    setSelectedOption(null);
    setDictated(false);
    setConfidence(undefined);
    setSubmissionResult(null);
    submissionKey.current = null;
  };

  const handleSubmitConfirm = async (payload: TraceSubmissionPayload) => {
    if (submitLock.current || isSubmitting) return null;
    submitLock.current = true;
    setIsSubmitting(true);
    setSubmissionError(null);
    try {
      const text = payload.answerText;
      if (submissionKey.current?.text !== text) submissionKey.current = { text, key: crypto.randomUUID() };
      const response = await TracewiseApi.submitTrace({ ...payload, inputMethod: dictated ? 'dictated' : 'typed', confidence, idempotencyKey: submissionKey.current.key });
      setSubmissionResult(response.data);
      submissionKey.current = null;
      if (response.data.trace) onTrace?.(response.data.trace);
      return response.data;
    } catch (error) {
      console.error(error);
      setSubmissionError(error instanceof Error ? error.message : 'Could not save this answer. Your text is still here; please retry.');
      return null;
    } finally {
      submitLock.current = false;
      setIsSubmitting(false);
    }
  };

  if (uiState === 'loading') return <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse"><div className="h-8 bg-stone-200 rounded w-1/4 mb-6" /><div className="h-96 bg-stone-200 rounded-xl" /></div>;
  if (!initialQuestion) return <main className="p-8">There are no unanswered diagnostic questions or recommendations available.</main>;
  if (uiState === 'error') return <div className="max-w-7xl mx-auto px-4 py-12"><ErrorDisplay message="Could not load the problem trace schema from the local test runner." onRetry={onRetry} /></div>;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div><h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900">Algorithmic Reasoning Studio</h1><p className="text-xs sm:text-sm text-stone-500 mt-0.5">Explain your reasoning in your own words.</p></div>
        <div className="flex items-center gap-3">
          <Button type="button" variant="secondary" size="sm" onClick={() => {
            const replayQuestion = questionBank?.find((question) => question.id === LINKED_LIST_REPLAY_QUESTION);
            if (replayQuestion) handleSelectQuestion(replayQuestion);
            else void TracewiseApi.getQuestion(LINKED_LIST_REPLAY_QUESTION).then(handleSelectQuestion);
          }}>Try the linked-list replay question</Button>
          {onOpenWorkbench && <Button type="button" variant="outline" size="sm" onClick={onOpenWorkbench} leftIcon={<Layers className="w-3.5 h-3.5" />}>Interactive Memory Workbench</Button>}
          <div className="hidden sm:flex items-center gap-2 text-xs bg-stone-100 border border-stone-200 px-3 py-1.5 rounded-lg"><span className="w-2 h-2 rounded-full bg-emerald-600" /><span>Studio</span></div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <section className="lg:col-span-5" aria-label="Question">
          <QuestionCard question={currentQuestion} questionsList={questionBank ?? []} selectedOption={selectedOption} onSelectOption={setSelectedOption} onSelectQuestion={handleSelectQuestion} />
          {currentQuestion.recommendationReason && <p className="mt-2 text-sm text-stone-600">Recommendation reason: {currentQuestion.recommendationReason}</p>}
        </section>
        <section className="lg:col-span-7" aria-label="Student Expression Field">
          {hasOptions ? (
            <div className="rounded-xl border border-stone-200 bg-white p-5 space-y-4">
              <p className="text-sm text-stone-600">Select an option, then review your answer.</p>
              <Button type="button" variant="primary" onClick={() => setIsReviewModalOpen(true)} disabled={!selectedOption}>Review your answer</Button>
            </div>
          ) : (
            <ExpressionEditor value={expressionText} onChange={(value) => setExpressionText(value)} isListening={isListening} isSupported={isSupported} errorMessage={errorMessage} interimText={interimText} onToggleListening={toggleListening} onClearError={clearError} onSubmitReview={() => setIsReviewModalOpen(true)} isSubmitDisabled={!expressionText.trim()} demoSamples={currentQuestion.options?.length ? [] : DEMO_SAMPLES} />
          )}
        </section>
      </div>
      {!hasOptions && <div className="flex flex-wrap items-center gap-4 rounded-lg border bg-white p-3 text-sm">
        <label className="flex items-center gap-2"><input type="checkbox" checked={dictated} onChange={(event) => setDictated(event.target.checked)} /> I dictated this with Wispr Flow (external dictation)</label>
        <label className="flex items-center gap-2">Confidence (optional): <select value={confidence ?? ''} onChange={(event) => setConfidence(event.target.value ? Number(event.target.value) : undefined)}><option value="">Not provided</option>{[1, 2, 3, 4, 5].map((number) => <option key={number} value={number}>{number}</option>)}</select></label>
      </div>}
      <SubmissionReviewModal isOpen={isReviewModalOpen} onClose={() => { if (!isSubmitting) setIsReviewModalOpen(false); }} question={currentQuestion} draftText={answerText} onUpdateDraftText={hasOptions ? () => undefined : setExpressionText} onSubmitConfirm={handleSubmitConfirm} isSubmitting={isSubmitting} submissionResult={submissionResult} submissionError={submissionError} onResetSubmission={() => { setSubmissionResult(null); submissionKey.current = null; }} inputMethod={dictated ? 'dictated' : 'typed'} confidence={confidence} onResultDone={(questionId) => { if (questionId) onQuestionChange?.(questionId); onRetry(); }} onViewMemoryReplay={onViewMemoryReplay} hasReplayTrace={hasReplayTrace} />
    </main>
  );
};
