import React from 'react';
import type { LearningGapItem } from '../../types/teacherAnalytics';
import { Card, CardHeader, CardBody } from '../common/Card';
import { Badge } from '../common/Badge';
import {
  TrendingDown,
  AlertTriangle,
  Flame,
} from 'lucide-react';

interface TopLearningGapsCardProps {
  gaps: LearningGapItem[];
  selectedConceptId: string | null;
  onSelectConcept: (conceptId: string) => void;
}

export const TopLearningGapsCard: React.FC<TopLearningGapsCardProps> = ({
  gaps,
  selectedConceptId,
  onSelectConcept,
}) => {
  const getUrgencyBadge = (urgency: LearningGapItem['urgency'], label: string) => {
    switch (urgency) {
      case 'critical':
        return (
          <Badge variant="red" size="sm" icon={<Flame className="w-3 h-3 text-rose-700" />}>
            {label}
          </Badge>
        );
      case 'elevated':
        return (
          <Badge variant="amber" size="sm" icon={<AlertTriangle className="w-3 h-3 text-amber-700" />}>
            {label}
          </Badge>
        );
      case 'moderate':
        return (
          <Badge variant="blue" size="sm">
            {label}
          </Badge>
        );
    }
  };

  return (
    <Card className="border-stone-200 bg-white text-stone-900 shadow-xs">
      <CardHeader
        className="border-b border-stone-200 bg-stone-50/70"
        action={
          <span className="text-xs text-rose-700 font-mono font-medium flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5" />
            Ranked by Deficit vs Benchmark
          </span>
        }
      >
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-stone-700" />
          <h2 className="font-semibold text-stone-900 text-sm">
            Concepts with Largest Learning Gaps
          </h2>
        </div>
      </CardHeader>

      <CardBody className="p-4 sm:p-5 space-y-3">
        <p className="text-xs text-stone-500">
          Ranked conceptual bottlenecks where cohort invariant proofs diverge furthest from target benchmark standards.
        </p>

        <div className="space-y-3" role="list" aria-label="Largest learning gaps list">
          {gaps.map((gap) => {
            const isSelected = selectedConceptId === gap.conceptId;

            return (
              <div
                key={gap.conceptId}
                role="listitem"
                tabIndex={0}
                onClick={() => onSelectConcept(gap.conceptId)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectConcept(gap.conceptId);
                  }
                }}
                aria-selected={isSelected}
                className={`p-3.5 rounded-lg border transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-stone-400 ${
                  isSelected
                    ? 'border-stone-800 bg-stone-50 shadow-2xs ring-1 ring-stone-800'
                    : 'border-stone-200 bg-stone-50/40 hover:border-stone-300 hover:bg-stone-50/80'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-stone-100 text-stone-800 border border-stone-200 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                      #{gap.rank}
                    </span>
                    <div>
                      <h3 className="font-semibold text-xs sm:text-sm text-stone-900">
                        {gap.conceptName}
                      </h3>
                      <span className="text-[10px] text-stone-500 font-mono">
                        {gap.category}
                      </span>
                    </div>
                  </div>

                  {getUrgencyBadge(gap.urgency, gap.urgencyLabel)}
                </div>

                {/* Metrics Breakdown */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-2.5 rounded-md bg-white border border-stone-200 text-xs font-mono">
                  <div>
                    <span className="text-stone-400 text-[10px] block font-sans">Current Mastery:</span>
                    <strong className="text-stone-900 text-sm font-bold">
                      {gap.classAveragePercent}%
                    </strong>
                  </div>

                  <div>
                    <span className="text-stone-400 text-[10px] block font-sans">Deficit Gap:</span>
                    <strong className="text-rose-700 text-sm font-bold">
                      -{gap.gapPercent}%
                    </strong>
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <span className="text-stone-400 text-[10px] block font-sans">Students Below Bar:</span>
                    <strong className="text-stone-700 text-xs">
                      {gap.affectedStudentCount} Students
                    </strong>
                  </div>
                </div>

                {/* Socratic Reteach Hint */}
                <div className="mt-2 text-[11px] text-stone-600 font-sans flex items-start gap-1.5">
                  <span className="font-semibold text-stone-800 shrink-0">Diagnostic Focus:</span>
                  <span>{gap.coreObstacle}</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
};
