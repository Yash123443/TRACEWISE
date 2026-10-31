import React from 'react';
import { Card, CardBody } from '../common/Card';
import { Badge } from '../common/Badge';
import {
  Mic,
  GitBranch,
  Wrench,
  RotateCcw,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

interface LearningLoopSectionProps {
  onGoToStudio: () => void;
  onGoToWorkbench: () => void;
  onGoToRevision: () => void;
}

export const LearningLoopSection: React.FC<LearningLoopSectionProps> = ({
  onGoToStudio,
  onGoToWorkbench,
  onGoToRevision,
}) => {
  const steps = [
    {
      step: '01',
      title: 'Explain',
      subtitle: 'Articulate Invariant Proofs',
      description:
        'Instead of blindly guessing code, express your algorithmic reasoning in natural language or hands-free voice dictation before typing.',
      icon: <Mic className="w-4 h-4 text-stone-700" />,
      tag: 'Learning Studio',
      actionLabel: 'Try the Studio',
      onAction: onGoToStudio,
      highlight: 'Voice & text input fields',
    },
    {
      step: '02',
      title: 'Inspect the Trace',
      subtitle: 'Simulate Memory & Pointers',
      description:
        'Watch exact memory allocations occur. Step forwards and backwards through the operation tree to observe address changes node-by-node.',
      icon: <GitBranch className="w-4 h-4 text-teal-700" />,
      tag: 'Memory Workbench',
      actionLabel: 'Inspect a Trace',
      onAction: onGoToWorkbench,
      highlight: 'Hex addresses & pointer arrows',
    },
    {
      step: '03',
      title: 'Correct',
      subtitle: 'Debug Mental Models',
      description:
        'Triggered an unreachable node or head overwrite trap? Rewire pointer operations in the Constraint Correction Lab to discover the invariant flaw.',
      icon: <Wrench className="w-4 h-4 text-amber-700" />,
      tag: 'Constraint Lab',
      actionLabel: 'Test Constraint Lab',
      onAction: onGoToWorkbench,
      highlight: 'Live orphan detection',
    },
    {
      step: '04',
      title: 'Practice Again',
      subtitle: 'Diagnostic Spaced Revision',
      description:
        'Your revision queue schedules questions based on specific past reasoning traps (e.g. use-after-free, short-circuit guards), not generic flashcards.',
      icon: <RotateCcw className="w-4 h-4 text-stone-700" />,
      tag: 'Revision Queue',
      actionLabel: 'View Revision Queue',
      onAction: onGoToRevision,
      highlight: 'Targeted misconception review',
    },
  ];

  return (
    <section className="py-14 sm:py-20 bg-stone-50 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="max-w-2xl mx-auto text-center space-y-3">
          <Badge variant="teal" size="sm">
            Pedagogical Engine
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
            The 4-Step Reasoning Loop
          </h2>
          <p className="text-sm text-stone-600 leading-relaxed">
            Tracewise replaces passive code submissions with an iterative cycle designed to align your mental model with machine execution.
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s) => (
            <Card
              key={s.step}
              className="border-stone-200 bg-white hover:border-stone-300 transition-all flex flex-col justify-between shadow-xs"
            >
              <CardBody className="p-5 space-y-4 flex flex-col justify-between h-full">
                <div className="space-y-3">
                  {/* Top Step Number and Icon */}
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-stone-700 bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                      Step {s.step}
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center">
                      {s.icon}
                    </div>
                  </div>

                  {/* Title and Subtitle */}
                  <div>
                    <h3 className="font-bold text-stone-900 text-base">
                      {s.title}
                    </h3>
                    <span className="text-xs font-semibold text-stone-600 font-mono block mt-0.5">
                      {s.subtitle}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {s.description}
                  </p>
                </div>

                {/* Bottom Highlight and Working CTA */}
                <div className="pt-3 border-t border-stone-100 space-y-2">
                  <div className="flex items-center gap-1.5 text-[11px] text-stone-500 font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span>{s.highlight}</span>
                  </div>

                  <button
                    onClick={s.onAction}
                    className="w-full text-left flex items-center justify-between text-xs font-semibold text-stone-800 hover:text-stone-900 py-1 transition-colors group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 rounded"
                  >
                    <span>{s.actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-stone-500 group-hover:translate-x-1 group-hover:text-stone-900 transition-all motion-reduce:transform-none" />
                  </button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
