import React from 'react';
import type { ConceptStatus } from '../../types/conceptGraph';
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  CircleDashed,
} from 'lucide-react';

interface StatusIndicatorProps {
  status: ConceptStatus;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  size = 'md',
  showLabel = true,
}) => {
  const config = {
    strong: {
      label: 'Solidified',
      icon: CheckCircle2,
      badgeStyle: 'bg-teal-50 text-teal-800 border-teal-200',
      iconColor: 'text-teal-700',
    },
    learning: {
      label: 'Learning',
      icon: Clock,
      badgeStyle: 'bg-blue-50 text-blue-800 border-blue-200',
      iconColor: 'text-blue-700',
    },
    'needs-revision': {
      label: 'Needs Revision',
      icon: AlertTriangle,
      badgeStyle: 'bg-amber-50 text-amber-800 border-amber-200',
      iconColor: 'text-amber-700',
    },
    'not-started': {
      label: 'Not Started',
      icon: CircleDashed,
      badgeStyle: 'bg-stone-100 text-stone-600 border-stone-200',
      iconColor: 'text-stone-400',
    },
  }[status];

  const IconComponent = config.icon;

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1 font-mono font-medium',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3 py-1.5 gap-2 font-semibold',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  return (
    <span
      className={`inline-flex items-center rounded-md border tracking-tight ${config.badgeStyle} ${sizeClasses[size]}`}
    >
      <IconComponent className={`${iconSizes[size]} ${config.iconColor} shrink-0`} />
      {showLabel && <span>{config.label}</span>}
    </span>
  );
};
