import React from 'react';
import { Button } from '../common/Button';
import { Mic, AlertCircle, Volume2 } from 'lucide-react';

interface DictationToolbarProps {
  isListening: boolean;
  isSupported: boolean;
  errorMessage: string | null;
  interimText: string;
  onToggleListening: () => void;
  designMode?: boolean;
  onInsertSampleVoice?: (phrase: string) => void;
  onClearError: () => void;
}

export const DictationToolbar: React.FC<DictationToolbarProps> = ({
  isListening, isSupported, errorMessage, interimText, onToggleListening, designMode = false,
  onInsertSampleVoice, onClearError,
}) => (
  <div className="p-3 bg-stone-50/80 border-b border-stone-200 flex flex-col gap-2.5">
    <div className="flex flex-wrap items-center gap-3">
      <p className="text-xs text-stone-600">Dictate with Wispr Flow (external tool) or type</p>
      {isSupported && <Button type="button" variant={isListening ? 'danger' : 'secondary'} size="sm" onClick={onToggleListening} aria-pressed={isListening}>
        <Mic className="w-3.5 h-3.5" /> {isListening ? 'Stop browser speech recognition' : 'Use browser speech recognition'}
      </Button>}
      {isListening && <span className="text-xs text-rose-700">Listening…</span>}
      {designMode && onInsertSampleVoice && (
        <button type="button" onClick={() => onInsertSampleVoice('This is a design preview of dictated text.')} className="text-xs underline">Insert design preview text</button>
      )}
    </div>
    {errorMessage && <div className="flex items-center justify-between p-2 rounded-md bg-amber-50 border border-amber-200 text-xs text-amber-800">
      <div className="flex items-center gap-2"><AlertCircle className="w-4 h-4" /><span>{errorMessage}</span></div>
      <button type="button" onClick={onClearError} className="underline">Dismiss</button>
    </div>}
    {isListening && interimText && <div className="text-xs text-stone-700 bg-white p-2 rounded border border-stone-300 flex items-center gap-2"><Volume2 className="w-3.5 h-3.5" /><span>{interimText}</span></div>}
  </div>
);
