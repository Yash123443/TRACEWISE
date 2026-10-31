import React from 'react';
import type { CohortMetadata } from '../../types/teacherAnalytics';
import { Badge } from '../common/Badge';
import {
  Users,
  ShieldAlert,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

interface TeacherHeaderProps {
  metadata: CohortMetadata;
}

export const TeacherHeader: React.FC<TeacherHeaderProps> = ({ metadata }) => {
  return (
    <header className="space-y-4">
      {/* Top Breadcrumb & Synthetic Data Flag */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-stone-100 border border-stone-300 text-stone-800 flex items-center justify-center shadow-2xs">
            <GraduationCap className="w-5 h-5 text-stone-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900">
                Teacher Insights & Cohort Diagnostics
              </h1>
              <Badge variant="teal" size="sm">
                {metadata.courseCode}
              </Badge>
            </div>
            <p className="text-xs text-stone-500 mt-0.5 font-mono">
              {metadata.courseTitle} • {metadata.semester}
            </p>
          </div>
        </div>

        {/* Clear Simulated Demo Data Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="purple"
            size="md"
            icon={<Sparkles className="w-3.5 h-3.5 text-purple-700" />}
          >
            {metadata.datasetLabel}
          </Badge>

          <Badge
            variant="teal"
            size="md"
            icon={<Users className="w-3.5 h-3.5 text-teal-700" />}
          >
            {metadata.studentsRepresented} Students Represented
          </Badge>
        </div>
      </div>

      {/* Simulated Data Notice Banner */}
      <div
        role="note"
        aria-label="Dataset simulation disclaimer"
        className="p-3.5 rounded-lg border border-stone-200 bg-stone-100 text-stone-700 flex items-start gap-3 text-xs leading-relaxed shadow-2xs"
      >
        <ShieldAlert className="w-4 h-4 text-stone-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-medium text-stone-800">
            <strong className="font-semibold text-stone-900">Simulated Demo Dataset:</strong>{' '}
            {metadata.datasetDisclaimer}
          </p>
          <p className="text-[11px] text-stone-500 font-mono">
            Diagnostic Scope: <span className="text-stone-700 font-semibold">{metadata.evaluationScope}</span> • {metadata.studentsRepresented} simulated student reasoning traces.
          </p>
        </div>
      </div>
    </header>
  );
};
