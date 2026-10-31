import React from 'react';
import { Keyboard, AlertCircle, RefreshCw } from 'lucide-react';

export type UiSimulationState = 'ready' | 'loading' | 'empty' | 'error';

interface StateSwitcherProps {
  currentState: UiSimulationState;
  onChangeState: (state: UiSimulationState) => void;
  onOpenShortcuts: () => void;
}

export const StateSwitcher: React.FC<StateSwitcherProps> = ({
  currentState,
  onChangeState,
  onOpenShortcuts,
}) => {
  return (
    <div
      role="region"
      aria-label="UI state preview controller"
      className="bg-white border border-stone-200 shadow-sm rounded-xl px-3.5 py-2 flex flex-wrap items-center justify-between gap-3 text-xs"
    >
      <div className="flex items-center gap-2 text-stone-500 font-medium">
        <span className="flex h-2 w-2 relative">
          <span className="relative inline-flex rounded-full h-2 w-2 bg-stone-500"></span>
        </span>
        <span className="hidden sm:inline">UI State Preview:</span>
      </div>

      <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-lg">
        <button
          onClick={() => onChangeState('ready')}
          className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
            currentState === 'ready'
              ? 'bg-white text-stone-900 shadow-2xs border border-stone-200'
              : 'text-stone-600 hover:text-stone-900'
          }`}
          aria-pressed={currentState === 'ready'}
        >
          Populated
        </button>

        <button
          onClick={() => onChangeState('loading')}
          className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
            currentState === 'loading'
              ? 'bg-white text-stone-900 shadow-2xs border border-stone-200'
              : 'text-stone-600 hover:text-stone-900'
          }`}
          aria-pressed={currentState === 'loading'}
        >
          Loading
        </button>

        <button
          onClick={() => onChangeState('empty')}
          className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
            currentState === 'empty'
              ? 'bg-white text-stone-900 shadow-2xs border border-stone-200'
              : 'text-stone-600 hover:text-stone-900'
          }`}
          aria-pressed={currentState === 'empty'}
        >
          Empty
        </button>

        <button
          onClick={() => onChangeState('error')}
          className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
            currentState === 'error'
              ? 'bg-rose-50 text-rose-800 shadow-2xs border border-rose-200'
              : 'text-stone-600 hover:text-stone-900'
          }`}
          aria-pressed={currentState === 'error'}
        >
          Error
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onOpenShortcuts}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-stone-600 hover:text-stone-900 hover:bg-stone-50 rounded-md transition-colors border border-stone-200"
          title="View Keyboard Shortcuts (?)"
        >
          <Keyboard className="w-3.5 h-3.5 text-stone-500" />
          <span className="hidden md:inline">Keys</span>
          <kbd className="px-1 py-0.2 bg-stone-100 border border-stone-300 rounded font-mono text-[10px]">
            ?
          </kbd>
        </button>
      </div>
    </div>
  );
};

export const ErrorDisplay: React.FC<{
  message?: string;
  onRetry: () => void;
}> = ({ message = 'Failed to synchronize evaluation records with the local gateway.', onRetry }) => {
  return (
    <div
      role="alert"
      className="p-6 bg-rose-50 border border-rose-200 rounded-xl flex flex-col items-center justify-center text-center max-w-lg mx-auto my-8 space-y-3 text-stone-900 shadow-2xs"
    >
      <div className="w-10 h-10 rounded-full bg-rose-100 border border-rose-300 text-rose-700 flex items-center justify-center">
        <AlertCircle className="w-5 h-5" />
      </div>
      <div>
        <h3 className="font-semibold text-stone-900 text-sm">Connection Interruption</h3>
        <p className="text-xs text-rose-700 mt-1">{message}</p>
      </div>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 text-xs font-medium px-4 py-2 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors focus-visible:ring-2 focus-visible:ring-stone-400 cursor-pointer shadow-xs"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        Retry Operation
      </button>
    </div>
  );
};
