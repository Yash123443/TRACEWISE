import React from 'react';
import type { RevisionDueStatus } from '../../types/revision';
import { AlertCircle, Clock, CheckCircle2 } from 'lucide-react';

interface RevisionStatusBadgeProps {
  status: RevisionDueStatus;
  customText?: string;
}

export const RevisionStatusBadge: React.FC<RevisionStatusBadgeProps> = ({
  status,
  customText,
}) => {
  const config = {
    due_now: {
      defaultText: 'Due Now',
      icon: AlertCircle,
      classes: 'bg-amber-50 text-amber-800 border-amber-200 font-semibold',
      iconColor: 'text-amber-700',
    },
    upcoming: {
      defaultText: 'Upcoming',
      icon: Clock,
      classes: 'bg-sky-50 text-sky-800 border-sky-200 font-medium',
      iconColor: 'text-sky-700',
    },
    completed: {
      defaultText: 'Completed',
      icon: CheckCircle2,
      classes: 'bg-teal-50 text-teal-800 border-teal-200 font-semibold',
      iconColor: 'text-teal-700',
    },
  }[status];

  const IconComponent = config.icon;
  const displayText = customText || config.defaultText;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs border tracking-tight select-none ${config.classes}`}
    >
      <IconComponent className={`w-3.5 h-3.5 ${config.iconColor} shrink-0`} />
      <span>{displayText}</span>
    </span>
  );
};
