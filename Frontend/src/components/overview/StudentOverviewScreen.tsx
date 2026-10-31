import React from 'react';
import { HeroNextActionCard } from './HeroNextActionCard';
import { ConceptProgressSection } from './ConceptProgressSection';
import { DueRevisionSection } from './DueRevisionSection';
import { RecentActivitySection } from './RecentActivitySection';
import { DashboardSkeleton } from '../common/Skeleton';
import { ErrorDisplay } from '../common/StateSwitcher';
import type { UiSimulationState } from '../common/StateSwitcher';
import type { StudentOverviewData } from '../../services/apiService';
import { Sparkles, ShieldCheck } from 'lucide-react';

interface StudentOverviewScreenProps {
  overviewData: StudentOverviewData;
  uiState: UiSimulationState;
  onStartLearning: (questionId?: string) => void;
  onOpenWorkbench?: () => void;
  onRetry: () => void;
}

export const StudentOverviewScreen: React.FC<StudentOverviewScreenProps> = ({
  overviewData,
  uiState,
  onStartLearning,
  onOpenWorkbench,
  onRetry,
}) => {
  if (uiState === 'loading') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardSkeleton />
      </div>
    );
  }

  if (uiState === 'error') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ErrorDisplay
          message="Could not synchronize student mastery indices with the evaluator."
          onRetry={onRetry}
        />
      </div>
    );
  }

  const { conceptProgress, dueRevisions, recentActivities, metadata } = overviewData;

  const displayRevisions = uiState === 'empty' ? [] : dueRevisions;
  const displayActivities = uiState === 'empty' ? [] : recentActivities;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Dataset provenance */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-lg bg-stone-100 border border-stone-200 text-xs text-stone-700 shadow-2xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-stone-600 shrink-0" />
          <span>
            <strong className="text-stone-900">{metadata.isMockData ? 'Simulated Learner Sandbox:' : 'Local learner data:'}</strong>{' '}
            <em>{metadata.datasetName}</em>. Engine-backed evaluation active.
          </span>
        </div>
        <span className="font-mono text-[11px] text-stone-600 bg-white px-2.5 py-0.5 rounded border border-stone-200 font-medium">
          Target: {metadata.studentProfile.targetGoal}
        </span>
      </div>

      {/* Hero Next Action */}
      <HeroNextActionCard
        onStartLearning={onStartLearning}
        onOpenWorkbench={onOpenWorkbench}
        nextAction={overviewData.nextAction}
      />

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <ConceptProgressSection
            progressData={conceptProgress}
            onSelectConcept={() => onStartLearning()}
          />

          <RecentActivitySection activities={displayActivities} />
        </div>

        <div className="space-y-8">
          <DueRevisionSection
            revisions={displayRevisions}
            onStartRevision={() => onStartLearning()}
          />

          {/* Quick Study Tip / Invariant Philosophy */}
          <div className="p-5 rounded-xl bg-white border border-stone-200 text-xs text-stone-700 space-y-2 shadow-xs">
            <div className="flex items-center gap-2 font-semibold text-stone-900">
              <Sparkles className="w-3.5 h-3.5 text-stone-600" />
              <span>Tracewise Invariant Principle</span>
            </div>
            <p className="leading-relaxed text-stone-600">
              Never rush to memorizing synthetic code templates. During algorithmic exam prep, the highest-yield skill is identifying <strong className="text-stone-900">which invariant remains true</strong> through loop iterations and pointer advances.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};
