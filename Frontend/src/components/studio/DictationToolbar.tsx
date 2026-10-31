import React from 'react';
import { Button } from '../common/Button';
import { Mic, RotateCcw, Volume2, AlertCircle, Sparkles } from 'lucide-react';

interface DictationToolbarProps {
  isListening: boolean;
  isSupported: boolean;
  errorMessage: string | null;
  interimText: string;
  onToggleListening: () => void;
  onInsertSampleVoice: (phrase: string) => void;
  onInsertSnippet: (snippet: string) => void;
  onResetStarter: () => void;
  onClearError: () => void;
}

export const DictationToolbar: React.FC<DictationToolbarProps> = ({
  isListening,
  errorMessage,
  interimText,
  onToggleListening,
  onInsertSampleVoice,
  onInsertSnippet,
  onResetStarter,
  onClearError,
}) => {
  const sampleVoicePhrases = [
    'The loop invariant holds because left and right pointers converge monotonically.',
    'When divergence occurs, we branch verify either left+1 or right-1.',
    'No additional heap allocations are made, achieving O(1) auxiliary space complexity.',
  ];

  return (
    <div className="p-3 bg-stone-50/80 border-b border-stone-200 flex flex-col gap-2.5">
      {/* Top action row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Voice dictation controls */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant={isListening ? 'danger' : 'secondary'}
            size="sm"
            onClick={onToggleListening}
            className={`font-medium shadow-2xs transition-all ${
              isListening ? 'animate-pulse ring-2 ring-rose-400 bg-rose-600 text-white' : ''
            }`}
            leftIcon={<Mic className={`w-3.5 h-3.5 ${isListening ? 'animate-bounce text-white' : 'text-stone-700'}`} />}
            aria-pressed={isListening}
            aria-label={isListening ? 'Stop voice dictation' : 'Start voice dictation into expression field'}
          >
            {isListening ? 'Recording voice...' : 'Dictate Reasoning'}
          </Button>

          {isListening && (
            <span className="flex items-center gap-1.5 text-xs text-rose-700 font-medium">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              Listening...
            </span>
          )}

          {!isListening && (
            <span className="hidden sm:inline text-xs text-stone-500 font-sans">
              Type or speak directly into the active field
            </span>
          )}
        </div>

        {/* Snippet / Formatting shortcuts */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-stone-500 mr-1 hidden md:inline">Quick Tokens:</span>
          
          <button
            type="button"
            onClick={() => onInsertSnippet('\n[Invariant: s[left] == s[right] maintains symmetry]\n')}
            className="px-2 py-0.5 text-xs bg-white hover:bg-stone-100 border border-stone-300 rounded text-stone-800 font-mono transition-colors cursor-pointer shadow-2xs"
            title="Insert Symmetry Invariant"
          >
            + Invariant
          </button>

          <button
            type="button"
            onClick={() => onInsertSnippet('\nTime: O(N) | Space: O(1) auxiliary\n')}
            className="px-2 py-0.5 text-xs bg-white hover:bg-stone-100 border border-stone-300 rounded text-stone-800 font-mono transition-colors cursor-pointer shadow-2xs"
            title="Insert Complexity Bounds"
          >
            + O(N) Bounds
          </button>

          <button
            type="button"
            onClick={() => onInsertSnippet('\nBoundary Check: while (left < right)\n')}
            className="px-2 py-0.5 text-xs bg-white hover:bg-stone-100 border border-stone-300 rounded text-stone-800 font-mono transition-colors cursor-pointer shadow-2xs"
            title="Insert Loop Boundary"
          >
            + Boundary
          </button>

          <button
            type="button"
            onClick={onResetStarter}
            className="p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded transition-colors ml-1 cursor-pointer"
            title="Reset text area to starter trace"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Dictation Sample Assist Row */}
      <div className="flex items-center gap-2 overflow-x-auto text-[11px] text-stone-500 py-0.5">
        <span className="flex items-center gap-1 text-stone-600 shrink-0 font-medium">
          <Sparkles className="w-3 h-3 text-stone-500" />
          Simulate speech:
        </span>
        {sampleVoicePhrases.map((phrase, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onInsertSampleVoice(phrase)}
            className="truncate max-w-[220px] px-2 py-0.5 rounded bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 transition-colors text-left shrink-0 cursor-pointer shadow-2xs"
            title={phrase}
          >
            "{phrase}"
          </button>
        ))}
      </div>

      {/* Mic permission or browser recognition error */}
      {errorMessage && (
        <div className="flex items-center justify-between p-2 rounded-md bg-amber-50 border border-amber-200 text-xs text-amber-800">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={onClearError}
            className="text-amber-800 hover:underline font-medium text-[11px] ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Active interim speech transcription preview */}
      {interimText && (
        <div className="text-xs font-mono text-stone-800 bg-white p-2 rounded border border-stone-300 flex items-center gap-2">
          <Volume2 className="w-3.5 h-3.5 text-stone-500 shrink-0 animate-pulse" />
          <span className="italic">"{interimText}"</span>
        </div>
      )}
    </div>
  );
};
