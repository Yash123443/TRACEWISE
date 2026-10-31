import React from 'react';
import type { ReteachSuggestion } from '../../types/teacherAnalytics';
import { Card, CardHeader, CardBody } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import {
  Lightbulb,
  Clock,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface ReteachSuggestionCardProps {
  suggestion: ReteachSuggestion;
  onOpenWorkbench: () => void;
  onOpenStudioQuestion: (questionId: string) => void;
}

export const ReteachSuggestionCard: React.FC<ReteachSuggestionCardProps> = ({
  suggestion,
  onOpenWorkbench,
  onOpenStudioQuestion,
}) => {
  return (
    <Card className="border-stone-300 bg-white text-stone-900 shadow-xs">
      <CardHeader
        className="border-b border-stone-200 bg-stone-50/70"
        action={
          <Badge variant="teal" size="sm" icon={<Clock className="w-3 h-3 text-teal-700" />}>
            {suggestion.durationEstimate}
          </Badge>
        }
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-stone-100 border border-stone-200 text-stone-800 flex items-center justify-center">
            <Lightbulb className="w-4 h-4 text-stone-700" />
          </div>
          <div>
            <h2 className="font-semibold text-stone-900 text-sm sm:text-base">
              Instructor Reteach Recommendation
            </h2>
            <span className="text-[11px] text-stone-500 font-mono">
              Directly addresses top cohort gap: {suggestion.targetGapConceptName}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardBody className="p-4 sm:p-5 space-y-4">
        {/* Title & Pedagogical Rationale */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-base sm:text-lg font-bold text-stone-900">
              {suggestion.title}
            </h3>
            <Badge variant="amber" size="sm">
              {suggestion.gapMagnitudeText}
            </Badge>
          </div>

          <p className="text-xs text-stone-700 leading-relaxed bg-stone-50 p-3.5 rounded-lg border border-stone-200">
            <strong className="text-stone-900">Pedagogical Rationale: </strong>
            {suggestion.pedagogicalRationale}
          </p>
        </div>

        {/* Action Steps */}
        <div className="space-y-3">
          <span className="text-xs font-semibold text-stone-800 uppercase tracking-wider block">
            Suggested 3-Step Lesson Blueprint:
          </span>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {suggestion.actionSteps.map((step) => (
              <div
                key={step.stepNumber}
                className="p-3.5 rounded-lg border border-stone-200 bg-stone-50/50 space-y-2 text-xs flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-stone-900 text-xs">
                      Step {step.stepNumber}
                    </span>
                    <span className="text-[10px] font-mono text-stone-500 bg-white border border-stone-200 px-1.5 py-0.5 rounded">
                      {step.durationMinutes} min
                    </span>
                  </div>

                  <h4 className="font-semibold text-stone-900 text-xs">
                    {step.stepTitle}
                  </h4>

                  <p className="text-stone-600 text-[11px] leading-relaxed">
                    {step.instruction}
                  </p>
                </div>

                {step.cCodeExample && (
                  <pre className="p-2 bg-stone-900 text-stone-100 rounded text-[10px] font-mono overflow-x-auto border border-stone-800">
                    {step.cCodeExample}
                  </pre>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action Links */}
        <div className="pt-3 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-stone-500 font-mono">
            Interactive drill resources:
          </span>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={onOpenWorkbench}
              leftIcon={<Layers className="w-3.5 h-3.5 text-stone-700" />}
            >
              Open Interactive Workbench
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => onOpenStudioQuestion(suggestion.studioQuestionId)}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Launch Studio Lesson
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};
