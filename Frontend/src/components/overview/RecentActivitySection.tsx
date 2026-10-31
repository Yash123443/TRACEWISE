import React from 'react';
import type { RecentActivityItem } from '../../types/tracewise';
import { Card, CardHeader, CardBody } from '../common/Card';
import { Badge } from '../common/Badge';
import { History, Clock, FileText } from 'lucide-react';

interface RecentActivitySectionProps {
  activities: RecentActivityItem[];
}

export const RecentActivitySection: React.FC<RecentActivitySectionProps> = ({ activities }) => {
  if (activities.length === 0) {
    return (
      <Card className="border-stone-200">
        <CardHeader>
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-stone-700" />
            <h3 className="font-semibold text-stone-900 text-sm">Recent Reasoning Log</h3>
          </div>
        </CardHeader>
        <CardBody className="py-8 text-center text-stone-500">
          <FileText className="w-8 h-8 text-stone-300 mx-auto mb-2" />
          <p className="text-sm font-medium text-stone-700">No sessions recorded yet</p>
          <p className="text-xs text-stone-400 mt-1">
            Complete your first trace reasoning drill in the Learning Studio.
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="border-stone-200">
      <CardHeader
        action={
          <span className="text-xs text-stone-500 font-mono">
            {activities.length} Recorded Sessions
          </span>
        }
      >
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-stone-700" />
          <h3 className="font-semibold text-stone-900 text-sm">
            Recent Reasoning Activity
          </h3>
        </div>
      </CardHeader>

      <CardBody className="p-4 space-y-3">
        {activities.map((act) => (
          <div
            key={act.id}
            className="p-3.5 rounded-lg border border-stone-200 bg-stone-50/50 hover:bg-white hover:border-stone-300 transition-all text-xs"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
              <span className="font-semibold text-stone-900">
                {act.problemTitle}
              </span>
              <div className="flex items-center gap-2">
                <Badge variant="teal" size="sm">
                  {act.outcomeLabel}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-stone-500 mb-2">
              <span>{act.category}</span>
              <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-stone-400" />
                  {act.durationMinutes === undefined ? 'Duration not recorded' : `${act.durationMinutes} min`}
                </span>
              <span>•</span>
              <span className="text-stone-400">{act.timestamp}</span>
            </div>

            {/* Reasoning snippet */}
            <div className="p-2.5 rounded-md bg-white border border-stone-200 text-[11px] text-stone-700 font-mono leading-relaxed">
              "{act.reasoningSnippet}"
            </div>
          </div>
        ))}
      </CardBody>
    </Card>
  );
};
