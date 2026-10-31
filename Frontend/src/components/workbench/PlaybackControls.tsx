import React from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Undo2,
} from 'lucide-react';
import { Button } from '../common/Button';

interface PlaybackControlsProps {
  currentStep: number;
  totalSteps: number;
  isPlaying: boolean;
  canUndo: boolean;
  onStepBack: () => void;
  onStepForward: () => void;
  onTogglePlay: () => void;
  onReset: () => void;
  onUndo: () => void;
}

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  currentStep,
  totalSteps,
  isPlaying,
  canUndo,
  onStepBack,
  onStepForward,
  onTogglePlay,
  onReset,
  onUndo,
}) => {
  return (
    <div
      role="toolbar"
      aria-label="Memory trace stepping controls"
      className="bg-white border border-stone-300 rounded-xl p-3 sm:p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 select-none"
    >
      {/* Undo & Reset actions */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onUndo}
          disabled={!canUndo}
          leftIcon={<Undo2 className="w-3.5 h-3.5" />}
          title="Undo last constraint correction or step"
        >
          Undo
        </Button>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onReset}
          leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          title="Reset to Step 0 (Key: R)"
        >
          Reset
        </Button>
      </div>

      {/* Primary Stepping Controls */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onStepBack}
          disabled={currentStep === 0}
          aria-label="Step Backward"
          className="p-2 sm:px-3 sm:py-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center gap-1.5 text-xs font-medium focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:outline-none cursor-pointer border border-stone-200"
          title="Previous Step (Key: Left Arrow)"
        >
          <SkipBack className="w-4 h-4" />
          <span className="hidden sm:inline">Back</span>
        </button>

        <button
          type="button"
          onClick={onTogglePlay}
          aria-label={isPlaying ? 'Pause auto-play' : 'Play operation trace'}
          className={`px-4 py-2 rounded-lg font-medium text-xs sm:text-sm flex items-center gap-2 transition-all shadow-xs focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:outline-none cursor-pointer ${
            isPlaying
              ? 'bg-amber-700 text-white hover:bg-amber-800'
              : 'bg-stone-900 text-white hover:bg-stone-800'
          }`}
          title="Play/Pause (Key: Space)"
        >
          {isPlaying ? (
            <>
              <Pause className="w-4 h-4 fill-current" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Step-Through</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onStepForward}
          disabled={currentStep === totalSteps - 1}
          aria-label="Step Forward"
          className="p-2 sm:px-3 sm:py-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center gap-1.5 text-xs font-medium focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:outline-none cursor-pointer border border-stone-200"
          title="Next Step (Key: Right Arrow)"
        >
          <span className="hidden sm:inline">Next</span>
          <SkipForward className="w-4 h-4" />
        </button>
      </div>

      {/* Step indicators & keyboard cues */}
      <div className="flex items-center gap-3 text-xs text-stone-500 font-mono">
        <span className="font-semibold text-stone-900">
          Step {currentStep + 1} / {totalSteps}
        </span>
        <span className="hidden md:inline text-stone-400">|</span>
        <span className="hidden md:inline text-[11px] text-stone-500">
          Keys: <kbd className="px-1 py-0.5 bg-stone-100 border border-stone-300 rounded text-stone-800">←</kbd> <kbd className="px-1 py-0.5 bg-stone-100 border border-stone-300 rounded text-stone-800">→</kbd> <kbd className="px-1 py-0.5 bg-stone-100 border border-stone-300 rounded text-stone-800">Space</kbd>
        </span>
      </div>
    </div>
  );
};
