import React from 'react';
import { ArrowRight, Clock, Target, Compass, Sparkles } from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import type { StudentOverviewData } from '../../services/apiService';

interface HeroNextActionCardProps {
  onStartLearning: (questionId: string) => void;
  onOpenWorkbench?: () => void;
  nextAction: StudentOverviewData['nextAction'];
}

export const HeroNextActionCard: React.FC<HeroNextActionCardProps> = ({
  onStartLearning,
  onOpenWorkbench,
  nextAction,
}) => {
  return (
    <div className="relative overflow-hidden rounded-xl bg-white border border-stone-300 text-stone-900 shadow-xs p-6 sm:p-8">
      {/* Background architectural pattern */}
      <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-5 pointer-events-none flex items-center justify-center">
        <Compass className="w-96 h-96 -mr-20 -mt-10 stroke-[0.8] text-stone-900" />
      </div>

      <div className="relative z-10 max-w-3xl">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge variant="teal" size="sm" icon={<Sparkles className="w-3 h-3 text-teal-700" />}>
            Adaptive Focus Recommendation
          </Badge>
          <span className="text-xs text-stone-500 font-mono">
            Derived from recent invariant drill logs
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 mb-2">
          {nextAction.title}
        </h2>

        <p className="text-sm sm:text-base text-stone-700 leading-relaxed mb-4">
          {nextAction.coreReasoningChallenge}
        </p>

        {/* Diagnostic Context highlight */}
        <div className="p-3.5 rounded-lg bg-stone-50 border border-stone-200 mb-6 flex items-start gap-3 text-xs text-stone-700">
          <div className="p-1 rounded bg-teal-100 text-teal-800 mt-0.5">
            <Target className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-semibold text-stone-900">Diagnostic Context: </span>
            {nextAction.whyRecommended}
          </div>
        </div>

        {/* Action Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-stone-200">
          <div className="flex items-center gap-4 text-xs text-stone-600">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-stone-500" />
              {nextAction.estimatedMinutes > 0 ? `~${nextAction.estimatedMinutes} min drill` : 'Time estimate unavailable'}
            </span>
            <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-800 font-medium border border-stone-200 font-mono text-[11px]">
              {nextAction.difficulty}
            </span>
            <span className="text-stone-500 hidden sm:inline">
              Category: {nextAction.category}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {onOpenWorkbench && (
              <Button
                variant="secondary"
                size="md"
                onClick={onOpenWorkbench}
              >
                Memory Workbench
              </Button>
            )}
            <Button
              variant="primary"
              size="md"
              onClick={() => onStartLearning(nextAction.questionId)}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Start Reasoning Studio
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
