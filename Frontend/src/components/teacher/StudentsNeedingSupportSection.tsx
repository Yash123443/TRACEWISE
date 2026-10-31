import React from 'react';
import type { StudentNeedingSupport, SupportThresholdConfig } from '../../types/teacherAnalytics';
import { Card, CardHeader, CardBody } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import {
  Users,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface StudentsNeedingSupportSectionProps {
  students: StudentNeedingSupport[];
  threshold: SupportThresholdConfig;
  onOpenWorkbench: () => void;
  onOpenStudioQuestion: (questionId: string) => void;
}

export const StudentsNeedingSupportSection: React.FC<StudentsNeedingSupportSectionProps> = ({
  students,
  threshold,
  onOpenWorkbench,
  onOpenStudioQuestion,
}) => {
  return (
    <Card className="border-stone-200 bg-white text-stone-900 shadow-xs">
      <CardHeader
        className="border-b border-stone-200 bg-stone-50/70"
        action={
          <Badge variant="amber" size="sm" icon={<AlertTriangle className="w-3 h-3 text-amber-700" />}>
            {threshold.studentsBelowThresholdCount} of {threshold.totalStudents} Flagged
          </Badge>
        }
      >
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-stone-700" />
          <h2 className="font-semibold text-stone-900 text-sm">
            Students Needing Support
          </h2>
        </div>
      </CardHeader>

      <CardBody className="p-4 sm:p-5 space-y-4">
        {/* Visible Demo Threshold Box */}
        <div
          role="region"
          aria-label="Student support criteria threshold"
          className="p-3.5 rounded-lg border border-amber-200 bg-amber-50/40 text-stone-800 text-xs space-y-1.5"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-amber-900 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-700" />
              Visible Demo Threshold Criteria:
            </span>
            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
              Cutoff Rule
            </span>
          </div>
          <p className="text-stone-700 leading-relaxed font-mono text-[11px]">
            {threshold.thresholdDescription}
          </p>
          <p className="text-[11px] text-amber-900">
            Note: All student entities below are synthetic demo records used for instructor workflow evaluation.
          </p>
        </div>

        {/* Student Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5" role="list" aria-label="Flagged students list">
          {students.map((student) => {
            return (
              <div
                key={student.studentId}
                role="listitem"
                className="p-3.5 rounded-lg border border-stone-200 bg-stone-50/40 hover:border-stone-300 transition-all flex flex-col justify-between gap-3 text-xs"
              >
                {/* Header with Simulated Learner ID and Mastery Badge */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-stone-900">
                        {student.displayIdentifier}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 border border-stone-200">
                        (Simulated)
                      </span>
                    </div>

                    <span
                      className={`font-mono text-xs font-semibold px-2 py-0.5 rounded border ${
                        student.masteryPercent < 50
                          ? 'bg-rose-50 text-rose-800 border-rose-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {student.masteryPercent}% Mastery
                    </span>
                  </div>

                  <p className="text-stone-600 text-[11px] leading-relaxed">
                    Primary Gap: <strong className="text-stone-900 font-semibold">{student.primaryStruggleConcept}</strong>
                  </p>
                </div>

                {/* Most recent flagged misconception */}
                <div className="p-2.5 rounded bg-white border border-stone-200 space-y-1 text-[11px]">
                  <span className="text-stone-500 font-semibold block">Flagged Invariant Flaw:</span>
                  <p className="text-stone-700 italic leading-snug">
                    "{student.flaggedMisconceptions[0] || student.recommendedIntervention}"
                  </p>
                </div>

                {/* Target Recommended Intervention Action */}
                <div className="pt-2 border-t border-stone-200 flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono text-stone-500">
                    {student.flaggedCount} misconceptions flagged
                  </span>

                  <div className="flex items-center gap-1.5">
                    {student.suggestedAction === 'review_workbench' ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={onOpenWorkbench}
                        className="text-[11px] py-1 px-2.5"
                      >
                        Memory Workbench
                      </Button>
                    ) : (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onOpenStudioQuestion(student.targetStudioQuestionId)}
                        rightIcon={<ArrowRight className="w-3 h-3" />}
                        className="text-[11px] py-1 px-2.5"
                      >
                        Open Studio Drill
                      </Button>
                    )}
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
