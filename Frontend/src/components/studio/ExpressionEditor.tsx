import React, { useRef } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { DictationToolbar } from './DictationToolbar';
import { ArrowRight, FileEdit } from 'lucide-react';

interface ExpressionEditorProps {
  value: string;
  onChange: (val: string, inputMethod: 'typed' | 'dictated' | 'hybrid') => void;
  isListening: boolean;
  isSupported: boolean;
  errorMessage: string | null;
  interimText: string;
  onToggleListening: () => void;
  onClearError: () => void;
  onSubmitReview: () => void;
  onInsertSampleVoice?: (phrase: string) => void;
  isSubmitDisabled?: boolean;
}

export const ExpressionEditor: React.FC<ExpressionEditorProps> = ({
  value, onChange, isListening, isSupported, errorMessage, interimText,
  onToggleListening, onClearError, onSubmitReview, onInsertSampleVoice, isSubmitDisabled = false,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const lineCount = value.trim() ? value.split('\n').length : 0;
  const designMode = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('design') === '1';
  const handleInsertVoice = (phrase: string) => {
    const element = textareaRef.current;
    const start = element?.selectionStart ?? value.length;
    const end = element?.selectionEnd ?? value.length;
    const prefix = start > 0 && !value.slice(0, start).endsWith('\n') && !value.slice(0, start).endsWith(' ') ? ' ' : '';
    onChange(value.slice(0, start) + prefix + phrase + value.slice(end), 'dictated');
  };

  return (
    <Card className="border-stone-200 bg-white flex flex-col shadow-xs">
      <div className="px-5 py-3 border-b border-stone-200 flex items-center justify-between gap-3 bg-stone-50/70">
        <div className="flex items-center gap-2"><FileEdit className="w-4 h-4 text-stone-700" /><h2 className="font-semibold text-stone-900 text-sm">Your explanation</h2></div>
        <div className="flex items-center gap-3 text-xs text-stone-600"><span>{wordCount} {wordCount === 1 ? 'word' : 'words'}</span><span>{lineCount} {lineCount === 1 ? 'line' : 'lines'}</span></div>
      </div>
      <DictationToolbar isListening={isListening} isSupported={isSupported} errorMessage={errorMessage} interimText={interimText} onToggleListening={onToggleListening} onClearError={onClearError} designMode={designMode} onInsertSampleVoice={onInsertSampleVoice ?? handleInsertVoice} />
      <div className="p-4">
        <label htmlFor="reasoning-textarea" className="sr-only">Your explanation</label>
        <textarea
          id="reasoning-textarea" ref={textareaRef} value={value}
          onChange={(event) => onChange(event.target.value, 'typed')}
          placeholder="Explain your reasoning in your own words."
          className="w-full min-h-56 p-3 font-mono text-sm leading-relaxed text-stone-900 bg-stone-50/40 rounded-lg border border-stone-200 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:bg-white resize-y"
        />
      </div>
      <div className="px-5 py-3 border-t border-stone-200 bg-stone-50/70 flex justify-end">
        <Button type="button" variant="primary" size="md" onClick={onSubmitReview} disabled={isSubmitDisabled} rightIcon={<ArrowRight className="w-4 h-4" />}>Review your answer</Button>
      </div>
    </Card>
  );
};
