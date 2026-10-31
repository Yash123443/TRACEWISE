import React from 'react';
import { Card, CardBody } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import {
  GraduationCap,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
} from 'lucide-react';

interface TeacherValueSectionProps {
  onOpenTeacher: () => void;
}

export const TeacherValueSection: React.FC<TeacherValueSectionProps> = ({
  onOpenTeacher,
}) => {
  const teacherBenefits = [
    {
      title: 'Diagnose Reasoning Roadblocks Early',
      description:
        'Instead of discovering misconceptions on graded exams, see where students get confused by pointer deallocation, NULL short-circuits, or recursive invariants as they practice.',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
    },
    {
      title: 'Automated Learning Gap Aggregation',
      description:
        'Tracewise clusters flawed reasoning traces into high-frequency misconception patterns without adding grading or manual code inspection hours.',
      icon: <TrendingDown className="w-5 h-5 text-rose-600" />,
    },
    {
      title: 'Actionable 15-Minute Reteach Plans',
      description:
        'Receive concrete micro-lecture blueprints and live workbench demonstration sequences tied directly to your cohort’s largest measured concept deficit.',
      icon: <Lightbulb className="w-5 h-5 text-teal-600" />,
    },
  ];

  return (
    <section className="py-14 sm:py-20 bg-stone-50 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="max-w-3xl space-y-3">
          <Badge variant="teal" size="sm">
            For Instructors & TAs
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
            Designed for Educators: Engine-Based Cohort Diagnostics
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            Standard automated grading tests whether code compiles. Tracewise reveals what students actually believe is happening inside the computer's memory.
          </p>
        </div>

        {/* 3 Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {teacherBenefits.map((b, i) => (
            <Card key={i} className="border-stone-200 bg-white text-stone-900 shadow-xs">
              <CardBody className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-stone-50 border border-stone-200 flex items-center justify-center">
                  {b.icon}
                </div>
                <h3 className="font-bold text-stone-900 text-base">
                  {b.title}
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {b.description}
                </p>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Banner with Direct CTA */}
        <div className="p-6 rounded-xl bg-white border border-stone-200 text-stone-900 flex flex-wrap items-center justify-between gap-4 shadow-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-stone-700" />
              <h3 className="font-bold text-base text-stone-900">
                Inspect the Teacher & Cohort Diagnostics Screen
              </h3>
            </div>
            <p className="text-xs text-stone-600 max-w-xl leading-relaxed">
              Inspect aggregate class mastery, misconception counts, and attention flags from the engine's clearly labelled simulated cohort.
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={onOpenTeacher}
            className="text-xs font-semibold"
          >
            Open Teacher Dashboard
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </div>
      </div>
    </section>
  );
};
