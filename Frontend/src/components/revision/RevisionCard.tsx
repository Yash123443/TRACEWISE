import React, { useState } from 'react';
import type { RevisionItem } from '../../types/revision';
import { Card, CardBody } from '../common/Card';
import { Button } from '../common/Button';
import { RevisionStatusBadge } from './RevisionStatusBadge';
import {
  ArrowRight,
  Info,
  AlertTriangle,
  CheckCircle2,
  Undo2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface RevisionCardProps {
  item: RevisionItem;
  onRevise: (questionId: string) => void;
  onToggleComplete: (itemId: string) => void;
}

export const RevisionCard: React.FC<RevisionCardProps> = ({
  item,
  onRevise,
  onToggleComplete,
}) => {
  const [showMisconception, setShowMisconception] = useState(false);
  const isCompleted = item.dueStatus === 'completed';
  const isDueNow = item.dueStatus === 'due_now';

  return (
    <Card
      className={`border transition-all duration-150 flex flex-col justify-between select-none shadow-xs ${
        isCompleted
          ? 'border-teal-200 bg-stone-50/70 text-stone-600 opacity-90'
          : isDueNow
          ? 'border-amber-300 bg-white shadow-xs hover:border-amber-400'
          : 'border-stone-200 bg-white hover:border-stone-300'
      }`}
    >
      <CardBody className="p-5 space-y-4 flex-1">
        {/* Top Header: Concept & Due Status Badge */}
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-stone-600 bg-stone-100 px-2 py-0.5 rounded border border-stone-200 font-medium">
              {item.category}
            </span>
            {item.difficulty && <span className="text-[10px] font-mono text-stone-500 bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
              {item.difficulty}
            </span>}
          </div>

          <RevisionStatusBadge status={item.dueStatus} customText={item.dueBadgeText} />
        </div>

        {/* Titles */}
        <div>
          <span className="text-xs font-semibold text-stone-500 block mb-0.5">
            {item.conceptTitle}
          </span>
          <h3 className="text-sm sm:text-base font-bold text-stone-900 tracking-tight leading-snug">
            {item.questionTitle}
          </h3>
        </div>

        {/* Why it was scheduled */}
        <div className="p-3 rounded-lg bg-stone-50 border border-stone-200 text-xs text-stone-700 space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-stone-900">
            <Info className="w-3.5 h-3.5 text-stone-600 shrink-0" />
            <span>Diagnostic Scheduling Reason:</span>
          </div>
          <p className="leading-relaxed pl-5 text-stone-600">
            {item.scheduleReason}
          </p>
        </div>

        {/* Relative Related Misconception */}
        {item.relatedMisconception && (
          <div className="border border-amber-200 rounded-lg overflow-hidden bg-amber-50/30">
            <button
              onClick={() => setShowMisconception(!showMisconception)}
              className="w-full p-2.5 flex items-center justify-between text-left text-xs font-medium text-amber-900 hover:bg-amber-100/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span className="font-semibold truncate">
                  Trap: {item.relatedMisconception.title}
                </span>
              </div>
              {showMisconception ? (
                <ChevronUp className="w-3.5 h-3.5 text-amber-700 shrink-0 ml-1" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-amber-700 shrink-0 ml-1" />
              )}
            </button>

            {showMisconception && (
              <div className="p-3 bg-white border-t border-amber-200 text-xs space-y-2 animate-in fade-in duration-100">
                <p className="text-stone-700 leading-relaxed text-[11px]">
                  {item.relatedMisconception.explanation}
                </p>
                {item.relatedMisconception.cTrapSnippet && (
                  <pre className="p-2 rounded bg-stone-900 text-stone-100 font-mono text-[11px] overflow-x-auto border border-stone-800">
                    {item.relatedMisconception.cTrapSnippet}
                  </pre>
                )}
              </div>
            )}
          </div>
        )}

        {/* Completion timestamp if recorded */}
        {item.completedAt && (
          <div className="flex items-center gap-1.5 text-xs text-teal-800 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-700" />
            <span>Completed: {item.completedAt}</span>
          </div>
        )}
      </CardBody>

      {/* Card Action Footer */}
      <div className="px-5 py-3 border-t border-stone-200 bg-stone-50/70 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => onToggleComplete(item.id)}
          className="text-xs text-stone-600 hover:text-stone-900 flex items-center gap-1 font-medium cursor-pointer"
        >
          {isCompleted ? (
            <>
              <Undo2 className="w-3 h-3 text-stone-500" />
              <span>Mark Incomplete</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3 h-3 text-stone-500" />
              <span>Mark Reviewed</span>
            </>
          )}
        </button>

        <Button
          variant={isDueNow ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => onRevise(item.questionId)}
          rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
        >
          Revise in Studio
        </Button>
      </div>
    </Card>
  );
};
