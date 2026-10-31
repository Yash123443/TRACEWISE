import React, { useRef } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { DictationToolbar } from './DictationToolbar';
import { ArrowRight, Save, Trash2, FileEdit } from 'lucide-react';

interface ExpressionEditorProps {
  value: string;
  onChange: (val: string, inputMethod: 'typed' | 'dictated' | 'hybrid') => void;
  isListening: boolean;
  isSupported: boolean;
  errorMessage: string | null;
  interimText: string;
  onToggleListening: () => void;
  onClearError: () => void;
  onResetStarter: () => void;
  onSubmitReview: () => void;
  invariantsToCheck?: string[];
}

export const ExpressionEditor: React.FC<ExpressionEditorProps> = ({
  value,
  onChange,
  isListening,
  isSupported,
  errorMessage,
  interimText,
  onToggleListening,
  onClearError,
  onResetStarter,
  onSubmitReview,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertTextAtCursor = (textToInsert: string, isFromVoice = false) => {
    const textarea = textareaRef.current;
    const startPos = textarea ? textarea.selectionStart : value.length;
    const endPos = textarea ? textarea.selectionEnd : value.length;

    const prefix = startPos > 0 && !value.slice(0, startPos).endsWith('\n') && !value.slice(0, startPos).endsWith(' ')
      ? ' '
      : '';

    const newContent =
      value.substring(0, startPos) +
      prefix +
      textToInsert +
      value.substring(endPos);

    onChange(newContent, isFromVoice ? 'dictated' : 'typed');

    setTimeout(() => {
      if (textarea) {
        textarea.focus();
        const nextPos = startPos + prefix.length + textToInsert.length;
        textarea.setSelectionRange(nextPos, nextPos);
      }
    }, 10);
  };

  const handleVoiceInsertion = (phrase: string) => {
    insertTextAtCursor(phrase, true);
  };

  const handleSnippetInsertion = (snippet: string) => {
    insertTextAtCursor(snippet, false);
  };

  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const lineCount = value.split('\n').length;

  return (
    <Card className="border-stone-200 bg-white h-full flex flex-col shadow-xs">
      {/* Editor Header */}
      <div className="px-5 py-3 border-b border-stone-200 flex items-center justify-between gap-3 bg-stone-50/70">
        <div className="flex items-center gap-2">
          <FileEdit className="w-4 h-4 text-stone-700" />
          <h2 className="font-semibold text-stone-900 text-sm">
            Reasoning Studio & Expression Field
          </h2>
        </div>

        <div className="flex items-center gap-3 text-xs text-stone-500">
          <span className="flex items-center gap-1 text-teal-800 font-medium">
            <Save className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Saved locally</span>
          </span>
          <span className="font-mono text-stone-600">{wordCount} words</span>
          <span className="font-mono text-stone-600 hidden md:inline">{lineCount} lines</span>
        </div>
      </div>

      {/* Dictation & Reasoning Helpers Toolbar */}
      <DictationToolbar
        isListening={isListening}
        isSupported={isSupported}
        errorMessage={errorMessage}
        interimText={interimText}
        onToggleListening={onToggleListening}
        onInsertSampleVoice={handleVoiceInsertion}
        onInsertSnippet={handleSnippetInsertion}
        onResetStarter={onResetStarter}
        onClearError={onClearError}
      />

      {/* Main Expression Input Area */}
      <div className="relative flex-1 flex flex-col p-4 bg-white">
        <label htmlFor="reasoning-textarea" className="sr-only">
          Detailed reasoning and invariant proof
        </label>
        <textarea
          id="reasoning-textarea"
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value, 'typed')}
          placeholder="Articulate step-by-step why your invariant remains true across state transitions..."
          className="w-full flex-1 p-3 font-mono text-xs sm:text-sm leading-relaxed text-stone-900 bg-stone-50/40 rounded-lg border border-stone-200 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:bg-white resize-none transition-all"
          spellCheck="false"
        />

        {/* Live speech transcription feedback banner */}
        {isListening && interimText && (
          <div className="mt-2 p-2.5 rounded-md bg-stone-100 border border-stone-300 text-xs text-stone-800 animate-pulse flex items-center justify-between">
            <span className="italic">"{interimText}"</span>
            <span className="text-[10px] text-stone-500 font-mono shrink-0 ml-2">Dictating live...</span>
          </div>
        )}
      </div>

      {/* Editor Footer Action Bar */}
      <div className="px-5 py-3 border-t border-stone-200 bg-stone-50/70 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onResetStarter}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 rounded-md transition-colors cursor-pointer border border-stone-200 bg-white"
            title="Reset to starter question template"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset to Starter</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-stone-500 hidden sm:inline">
            Press <kbd className="px-1.5 py-0.5 rounded bg-white border border-stone-300 font-mono text-[10px] text-stone-800 shadow-2xs">Ctrl + Enter</kbd> to audit
          </span>
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={onSubmitReview}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Review & Audit Trace
          </Button>
        </div>
      </div>
    </Card>
  );
};
