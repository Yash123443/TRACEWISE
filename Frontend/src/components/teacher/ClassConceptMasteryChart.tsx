import React from 'react';
import type { ConceptMasteryAggregate } from '../../types/teacherAnalytics';
import { Card, CardHeader, CardBody } from '../common/Card';
import { Badge } from '../common/Badge';
import {
  BarChart3,
  CheckCircle2,
  HelpCircle,
  AlertTriangle,
  ChevronRight,
  Target,
} from 'lucide-react';

interface ClassConceptMasteryChartProps {
  concepts: ConceptMasteryAggregate[];
  selectedConceptId: string | null;
  onSelectConcept: (conceptId: string) => void;
}

export const ClassConceptMasteryChart: React.FC<ClassConceptMasteryChartProps> = ({
  concepts,
  selectedConceptId,
  onSelectConcept,
}) => {
  const getTierBadge = (tier: ConceptMasteryAggregate['masteryTier'], label: string) => {
    switch (tier) {
      case 'solidified':
        return (
          <Badge variant="teal" size="sm" icon={<CheckCircle2 className="w-3 h-3 text-teal-700" />}>
            {label}
          </Badge>
        );
      case 'developing':
        return (
          <Badge variant="blue" size="sm" icon={<HelpCircle className="w-3 h-3 text-blue-700" />}>
            {label}
          </Badge>
        );
      case 'critical_gap':
        return (
          <Badge variant="amber" size="sm" icon={<AlertTriangle className="w-3 h-3 text-amber-700" />}>
            {label}
          </Badge>
        );
    }
  };

  const getBarColor = (tier: ConceptMasteryAggregate['masteryTier']) => {
    switch (tier) {
      case 'solidified':
        return 'bg-teal-700';
      case 'developing':
        return 'bg-blue-600';
      case 'critical_gap':
        return 'bg-amber-600';
    }
  };

  return (
    <Card className="border-stone-200 bg-white text-stone-900 shadow-xs">
      <CardHeader
        className="border-b border-stone-200 bg-stone-50/70"
        action={
          <div className="flex items-center gap-3 text-xs text-stone-500 font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-700"></span> Solidified (≥80%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span> Developing
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-600"></span> Critical Gap
            </span>
          </div>
        }
      >
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-stone-700" />
          <h2 className="font-semibold text-stone-900 text-sm">
            Class-Wide Mastery by Concept
          </h2>
        </div>
      </CardHeader>

      <CardBody className="p-4 sm:p-5 space-y-4">
        <p className="text-xs text-stone-500">
          Click any concept to open the supporting diagnostic data, failure points, and distribution breakdown.
        </p>

        {/* Concept Mastery Row Items */}
        <div className="space-y-3" role="list" aria-label="Class-wide concept mastery breakdown">
          {concepts.map((concept) => {
            const isSelected = selectedConceptId === concept.conceptId;

            return (
              <div
                key={concept.conceptId}
                role="listitem"
                tabIndex={0}
                onClick={() => onSelectConcept(concept.conceptId)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectConcept(concept.conceptId);
                  }
                }}
                aria-selected={isSelected}
                className={`p-3.5 rounded-lg border transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-stone-400 ${
                  isSelected
                    ? 'border-stone-800 bg-stone-50 shadow-2xs ring-1 ring-stone-800'
                    : 'border-stone-200 bg-stone-50/40 hover:border-stone-300 hover:bg-stone-50/80'
                }`}
              >
                {/* Header row of the concept item */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs sm:text-sm text-stone-900">
                      {concept.conceptName}
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-stone-100 text-stone-600 border border-stone-200">
                      {concept.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {getTierBadge(concept.masteryTier, concept.masteryTierLabel)}
                    <ChevronRight
                      className={`w-4 h-4 text-stone-400 transition-transform ${
                        isSelected ? 'rotate-90 text-stone-900' : ''
                      }`}
                    />
                  </div>
                </div>

                {/* Progress Bar & Benchmark Visualization */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-stone-700 flex items-center gap-1.5">
                      Class Mastery: <strong className="font-mono text-stone-900">{concept.classMasteryPercent}%</strong>
                    </span>

                    <span className="text-stone-500 font-mono text-[11px] flex items-center gap-1">
                      <Target className="w-3 h-3 text-stone-600" />
                      Target Benchmark: {concept.benchmarkTargetPercent}%
                      {concept.gapPercent > 0 && (
                        <span className="text-rose-700 font-bold ml-1">
                          (-{concept.gapPercent}% Gap)
                        </span>
                      )}
                    </span>
                  </div>

                  {/* Relative bar track with target marker at 85% */}
                  <div
                    role="meter"
                    aria-label={`${concept.conceptName} class mastery`}
                    aria-valuenow={concept.classMasteryPercent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    className="relative w-full h-2.5 rounded-full bg-stone-100 overflow-hidden border border-stone-200"
                  >
                    {/* Fill */}
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${getBarColor(
                        concept.masteryTier
                      )}`}
                      style={{ width: `${concept.classMasteryPercent}%` }}
                    />

                    {/* Benchmark vertical tick at 85% */}
                    <div
                      title={`Target Benchmark: ${concept.benchmarkTargetPercent}%`}
                      className="absolute top-0 bottom-0 w-0.5 bg-stone-900 z-10 opacity-80"
                      style={{ left: `${concept.benchmarkTargetPercent}%` }}
                    />
                  </div>

                  {/* Student Distribution Counts (Textual & Accessible) */}
                  <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1 font-mono">
                    <span>
                      Solidified: <strong className="text-teal-800 font-bold">{concept.distribution.solidifiedStudents}</strong>
                    </span>
                    <span>
                      Developing: <strong className="text-blue-800 font-bold">{concept.distribution.developingStudents}</strong>
                    </span>
                    <span>
                      Critical Gap: <strong className="text-amber-800 font-bold">{concept.distribution.criticalGapStudents}</strong>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
};
