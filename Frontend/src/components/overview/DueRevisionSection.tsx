import React from 'react';
import type { DueRevisionItem } from '../../types/tracewise';
import { Card, CardHeader, CardBody } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { RotateCcw, AlertCircle, ArrowRight, CheckCircle } from 'lucide-react';

interface DueRevisionSectionProps {
  revisions: DueRevisionItem[];
  onStartRevision: (conceptId: string) => void;
}

export const DueRevisionSection: React.FC<DueRevisionSectionProps> = ({
  revisions,
  onStartRevision,
}) => {
  if (revisions.length === 0) {
    return (
      <Card className="border-stone-200">
        <CardHeader>
          <div className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-stone-700" />
            <h3 className="font-semibold text-stone-900 text-sm">Spaced Trace Revisions</h3>
          </div>
        </CardHeader>
        <CardBody className="py-8 text-center text-stone-500">
          <CheckCircle className="w-8 h-8 text-teal-700 mx-auto mb-2 opacity-80" />
          <p className="text-sm font-medium text-stone-800">All due traces verified</p>
          <p className="text-xs text-stone-500 mt-1">
            No retention decays flagged for today. Keep practicing or explore new concepts.
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="border-stone-200">
      <CardHeader
        action={
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
            {revisions.length} Due for Review
          </span>
        }
      >
        <div className="flex items-center gap-2">
          <RotateCcw className="w-4 h-4 text-stone-700" />
          <h3 className="font-semibold text-stone-900 text-sm">
            Due Spaced Revisions
          </h3>
        </div>
      </CardHeader>

      <CardBody className="p-4 space-y-3">
        {revisions.map((item) => {
          const isHigh = item.urgency === 'high';
          return (
            <div
              key={item.id}
              className={`p-3.5 rounded-lg border transition-all ${
                isHigh
                  ? 'bg-amber-50/30 border-amber-200 hover:border-amber-300'
                  : 'bg-stone-50/50 border-stone-200 hover:border-stone-300'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <span className="text-xs font-semibold text-stone-900">
                  {item.title}
                </span>
                <Badge
                  variant={isHigh ? 'amber' : 'gray'}
                  size="sm"
                >
                  {item.dueLabel}
                </Badge>
              </div>

              <div className="text-[11px] text-stone-500 mb-2 flex items-center gap-2">
                <span>{item.category}</span>
                <span>•</span>
                {item.retentionEstimate === undefined
                  ? <span>Retention estimate unavailable</span>
                  : <span>Retention: <strong className="font-mono text-stone-700">{item.retentionEstimate}%</strong></span>}
              </div>

              {item.lastReasoningFlaw && (
                <div className="p-2.5 rounded-md bg-white border border-stone-200 text-[11px] text-stone-700 mb-3 flex items-start gap-2">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium text-stone-900">Previous Reasoning Gap: </span>
                    {item.lastReasoningFlaw}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onStartRevision(item.conceptId)}
                  rightIcon={<ArrowRight className="w-3 h-3" />}
                  className="text-xs py-1"
                >
                  Revise in Studio
                </Button>
              </div>
            </div>
          );
        })}
      </CardBody>
    </Card>
  );
};
