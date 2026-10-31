import React from 'react';
import type { NavigationTab } from '../../types/tracewise';
import { LandingHero } from './LandingHero';
import { LearningLoopSection } from './LearningLoopSection';
import { WorkbenchPreviewSection } from './WorkbenchPreviewSection';
import { TeacherValueSection } from './TeacherValueSection';
import { GitBranch, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '../common/Button';

interface LandingPageProps {
  onNavigate: (tab: NavigationTab) => void;
  onSelectQuestion?: (questionId: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigate,
}) => {
  return (
    <div className="min-h-full flex flex-col animate-in fade-in duration-200 bg-[#fbfbfa]">
      {/* 1. Hero Section with Headline and 2D/3D Concept Constellation */}
      <LandingHero
        onStartLearning={() => onNavigate('overview')}
        onOpenWorkbench={() => onNavigate('workbench')}
        onOpenConceptMap={() => onNavigate('concept-map')}
      />

      {/* 2. Four-Step Reasoning Loop (Explain, Inspect Trace, Correct, Practice Again) */}
      <LearningLoopSection
        onGoToStudio={() => onNavigate('learn')}
        onGoToWorkbench={() => onNavigate('workbench')}
        onGoToRevision={() => onNavigate('revision')}
      />

      {/* 3. Interactive Memory Workbench Preview Section */}
      <WorkbenchPreviewSection
        onOpenWorkbench={() => onNavigate('workbench')}
      />

      {/* 4. Teacher-Facing Value Section */}
      <TeacherValueSection
        onOpenTeacher={() => onNavigate('teacher')}
      />

      {/* 5. Bottom Call to Action Section */}
      <section className="py-16 bg-stone-100 border-b border-stone-200 text-stone-900 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-stone-200 text-stone-700 text-xs font-mono shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
            <span>Ready for Student & Educator Exploration</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
            Start Debugging Your Reasoning Today
          </h2>

          <p className="text-sm text-stone-600 max-w-xl mx-auto leading-relaxed">
            Jump directly into the student overview, articulate invariant proofs in the learning studio, or manipulate heap memory in the interactive workbench.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              variant="primary"
              size="lg"
              onClick={() => onNavigate('overview')}
              className="font-semibold text-sm shadow-xs"
            >
              Enter Student Overview
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            <Button
              variant="secondary"
              size="lg"
              onClick={() => onNavigate('learn')}
              className="text-sm font-medium"
            >
              Open Learning Studio
            </Button>
          </div>
        </div>
      </section>

      {/* 6. Footer with Working Screen Navigation & Keyboard Accessibility Hints */}
      <footer className="bg-white text-stone-600 py-10 border-t border-stone-200 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-stone-900 text-white flex items-center justify-center font-bold">
                <GitBranch className="w-4 h-4" />
              </div>
              <span className="font-bold text-stone-900 text-sm">
                Tracewise
              </span>
              <span className="text-[10px] font-mono uppercase bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded border border-stone-200">
                DSA Reasoning Workbench
              </span>
            </div>

            {/* Direct Tab Navigation Links (Zero dead buttons) */}
            <nav className="flex flex-wrap items-center gap-4 text-xs font-medium">
              <button
                onClick={() => onNavigate('overview')}
                className="hover:text-stone-900 transition-colors cursor-pointer"
              >
                Student Overview
              </button>
              <button
                onClick={() => onNavigate('learn')}
                className="hover:text-stone-900 transition-colors cursor-pointer"
              >
                Learn Studio
              </button>
              <button
                onClick={() => onNavigate('workbench')}
                className="hover:text-stone-900 transition-colors cursor-pointer"
              >
                Memory Workbench
              </button>
              <button
                onClick={() => onNavigate('concept-map')}
                className="hover:text-stone-900 transition-colors cursor-pointer"
              >
                Concept Map
              </button>
              <button
                onClick={() => onNavigate('revision')}
                className="hover:text-stone-900 transition-colors cursor-pointer"
              >
                Revision
              </button>
              <button
                onClick={() => onNavigate('teacher')}
                className="hover:text-stone-900 transition-colors cursor-pointer"
              >
                Teacher Insights
              </button>
            </nav>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-stone-500 font-mono">
            <p>
              Tracewise — Purpose-built adaptive exam preparation for algorithmic invariants & data structures in C.
            </p>
            <p>
              Keyboard Navigation: <kbd className="px-1 py-0.5 bg-stone-100 rounded border border-stone-200 text-stone-700">Alt + 0</kbd> to <kbd className="px-1 py-0.5 bg-stone-100 rounded border border-stone-200 text-stone-700">Alt + 6</kbd>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
