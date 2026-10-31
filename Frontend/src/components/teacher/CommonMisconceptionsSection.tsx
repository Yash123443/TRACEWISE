import React from 'react';
import type { MisconceptionPattern } from '../../types/teacherAnalytics';
import { Card, CardHeader, CardBody } from '../common/Card';
import { Badge } from '../common/Badge';
import {
  AlertOctagon,
  AlertTriangle,
} from 'lucide-react';

interface CommonMisconceptionsSectionProps {
  misconceptions: MisconceptionPattern[];
  selectedMisconceptionId: string | null;
  onSelectMisconception: (id: string) => void;
}

export const CommonMisconceptionsSection: React.FC<CommonMisconceptionsSectionProps> = ({
  misconceptions,
  selectedMisconceptionId,
  onSelectMisconception,
}) => {
  const getSeverityBadge = (severity: MisconceptionPattern['severity'], label: string) => {
    switch (severity) {
      case 'high':
        return (
          <Badge variant="red" size="sm" icon={<AlertOctagon className="w-3 h-3 text-rose-700" />}>
            {label}
          </Badge>
        );
      case 'medium':
        return (
          <Badge variant="amber" size="sm" icon={<AlertTriangle className="w-3 h-3 text-amber-700" />}>
            {label}
          </Badge>
        );
      case 'low':
        return (
          <Badge variant="gray" size="sm">
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
          <span className="text-xs text-stone-500 font-mono">
            {misconceptions.length} Patterns Flagged
          </span>
        }
      >
        <div className="flex items-center gap-2">
          <AlertOctagon className="w-4 h-4 text-amber-700" />
          <h2 className="font-semibold text-stone-900 text-sm">
            Common Misconception Patterns & Frequencies
          </h2>
        </div>
      </CardHeader>

      <CardBody className="p-4 sm:p-5 space-y-3">
        <p className="text-xs text-stone-500">
          Recurring flawed invariant logic extracted across student trace submissions. Click to inspect sample flawed C code and recommended diagnostic Socratic prompts.
        </p>

        <div className="space-y-3" role="list" aria-label="Common misconceptions list">
          {misconceptions.map((pattern) => {
            const isSelected = selectedMisconceptionId === pattern.id;

            return (
              <div
                key={pattern.id}
                role="listitem"
                tabIndex={0}
                onClick={() => onSelectMisconception(pattern.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectMisconception(pattern.id);
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
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-stone-100 text-stone-600 border border-stone-200">
                        {pattern.conceptName}
                      </span>
                      {getSeverityBadge(pattern.severity, pattern.severityLabel)}
                    </div>
                    <h3 className="font-semibold text-xs sm:text-sm text-stone-900 pt-0.5">
                      {pattern.patternTitle}
                    </h3>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-mono text-xs font-bold text-stone-900 block">
                      {pattern.studentCount} Students
                    </span>
                    <span className="text-[10px] text-stone-500 font-mono">
                      {pattern.prevalencePercent}% cohort
                    </span>
                  </div>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed">
                  {pattern.invariantViolation}
                </p>

                {/* Trap signature snippet */}
                {pattern.cCodeTrapSnippet && (
                  <div className="mt-2 p-2 rounded bg-stone-900 text-stone-100 font-mono text-[11px] overflow-x-auto border border-stone-800">
                    <code>{pattern.cCodeTrapSnippet}</code>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
};
