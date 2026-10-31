import React, { useState, useEffect } from 'react';
import type { NavigationTab } from '../../types/tracewise';
import type { TeacherAnalyticsData } from '../../types/teacherAnalytics';
import type { TeacherAggregate } from '../../../../TRACEWISE/src/engine/contracts/index.js';
import { TracewiseApi } from '../../services/apiService';
import { TEACHER_ANALYTICS_FIXTURE } from '../../mock/teacherAnalyticsFixture';
import type { UiSimulationState } from '../common/StateSwitcher';
import { ErrorDisplay } from '../common/StateSwitcher';
import { Skeleton } from '../common/Skeleton';
import { Card, CardBody } from '../common/Card';
import { Button } from '../common/Button';
import { Users } from 'lucide-react';

import { TeacherHeader } from './TeacherHeader';
import { ClassConceptMasteryChart } from './ClassConceptMasteryChart';
import { TopLearningGapsCard } from './TopLearningGapsCard';
import { CommonMisconceptionsSection } from './CommonMisconceptionsSection';
import { StudentsNeedingSupportSection } from './StudentsNeedingSupportSection';
import { ReteachSuggestionCard } from './ReteachSuggestionCard';
import { TeacherDetailPanel } from './TeacherDetailPanel';

interface TeacherScreenProps {
  uiState?: UiSimulationState;
  onNavigateToTab?: (tab: NavigationTab) => void;
  onSelectQuestion?: (questionId: string) => void;
}

export const TeacherScreen: React.FC<TeacherScreenProps> = ({
  uiState = 'ready',
  onNavigateToTab = () => {},
  onSelectQuestion = () => {},
}) => {
  const [data, setData] = useState<TeacherAnalyticsData | null>(TEACHER_ANALYTICS_FIXTURE);
  const [engineData, setEngineData] = useState<TeacherAggregate | null>(null);
  const [selectedConceptId, setSelectedConceptId] = useState<string | null>(null);
  const [selectedMisconceptionId, setSelectedMisconceptionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const [res, engineRes] = await Promise.all([
        TracewiseApi.getTeacherAnalytics(),
        TracewiseApi.getEngineTeacherAnalytics(),
      ]);
      setData(res.data);
      setEngineData(engineRes.data);
    } catch (err: any) {
      console.error(err);
      setFetchError(err.message || 'Failed to load cohort analytics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // Handle concept selection (closes misconception inspector)
  const handleSelectConcept = (conceptId: string) => {
    if (selectedConceptId === conceptId) {
      setSelectedConceptId(null);
    } else {
      setSelectedConceptId(conceptId);
      setSelectedMisconceptionId(null);
    }
  };

  // Handle misconception selection (closes concept inspector)
  const handleSelectMisconception = (misconceptionId: string) => {
    if (selectedMisconceptionId === misconceptionId) {
      setSelectedMisconceptionId(null);
    } else {
      setSelectedMisconceptionId(misconceptionId);
      setSelectedConceptId(null);
    }
  };

  const handleCloseDetail = () => {
    setSelectedConceptId(null);
    setSelectedMisconceptionId(null);
  };

  const handleOpenWorkbench = () => {
    onNavigateToTab('workbench');
  };

  const handleOpenStudioQuestion = (questionId: string) => {
    onSelectQuestion(questionId);
    onNavigateToTab('learn');
  };

  // Determine current active item for the detail inspector
  const activeConcept =
    data?.conceptsMastery.find((c) => c.conceptId === selectedConceptId) || null;
  const activeMisconception =
    data?.commonMisconceptions.find((m) => m.id === selectedMisconceptionId) || null;

  // Handle simulated / live error states
  if (uiState === 'error' || fetchError) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-150">
        <ErrorDisplay
          message={fetchError || 'Unable to establish secure connection to teacher analytics service.'}
          onRetry={fetchAnalytics}
        />
      </main>
    );
  }

  // Handle simulated / live loading states
  if (uiState === 'loading' || isLoading || !data) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-pulse" aria-label="Loading teacher analytics...">
        {/* Header skeleton */}
        <div className="h-20 bg-stone-200 rounded-xl w-full" />
        {/* Reteach banner skeleton */}
        <div className="h-44 bg-stone-200 rounded-xl w-full" />
        {/* Two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 space-y-6">
            <Skeleton className="h-64 rounded-xl w-full" />
            <Skeleton className="h-80 rounded-xl w-full" />
          </div>
          <div className="lg:col-span-6 space-y-6">
            <Skeleton className="h-80 rounded-xl w-full" />
            <Skeleton className="h-80 rounded-xl w-full" />
          </div>
        </div>
      </main>
    );
  }

  // Handle simulated empty state
  if (uiState === 'empty') {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-150">
        <TeacherHeader metadata={data.metadata} />
        <Card className="border-stone-200 max-w-xl mx-auto my-12 text-center bg-white">
          <CardBody className="p-8 sm:p-12 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-stone-100 text-stone-500 flex items-center justify-center mx-auto">
              <Users className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-bold text-stone-900">
                No Cohort Trace Analytics Recorded Yet
              </h2>
              <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
                As simulated learners submit reasoning proofs in the Learning Studio and step through the Memory Workbench, class aggregates and misconception frequencies will populate automatically.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchAnalytics}
              className="mt-2 text-xs"
            >
              Refresh Synthetic Diagnostic Queue
            </Button>
          </CardBody>
        </Card>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-150 text-stone-900">
      {/* 1. Header with Course Info, 48 Students Represented, and Clear Simulated Demo Data Label */}
      <TeacherHeader metadata={data.metadata} />

      {engineData && (
        <Card className="border-stone-300 bg-stone-50">
          <CardBody className="p-4 space-y-2">
            <div className="flex flex-wrap justify-between gap-2 text-xs">
              <strong className="text-stone-900">Local engine aggregate · {engineData.dataSource}</strong>
              <span className="text-stone-600">{engineData.learnerCount} local learner profile{engineData.learnerCount === 1 ? '' : 's'}</span>
            </div>
            <p className="text-[11px] text-stone-600">
              {engineData.conceptMastery.length} assessed concepts · {engineData.topMisconceptions.length} recorded misconception patterns · {engineData.learnersNeedingAttention.length} learners flagged at or below the engine threshold ({Math.round(engineData.attentionThreshold * 100)}%).
            </p>
            {engineData.reteachOutline.length > 0 && <p className="text-[11px] text-stone-700">Engine guidance: {engineData.reteachOutline.join(' ')}</p>}
          </CardBody>
        </Card>
      )}

      {/* 2. Short Reteach Suggestion Tied Directly to Top Class Gap */}
      <ReteachSuggestionCard
        suggestion={data.reteachSuggestion}
        onOpenWorkbench={handleOpenWorkbench}
        onOpenStudioQuestion={handleOpenStudioQuestion}
      />

      {/* 3. Two-Column Diagnostic Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Top Learning Gaps & Class-Wide Concept Mastery */}
        <section className="lg:col-span-6 space-y-8" aria-label="Concept mastery & gap analytics">
          {/* Concepts with largest learning gaps */}
          <TopLearningGapsCard
            gaps={data.topLearningGaps}
            selectedConceptId={selectedConceptId}
            onSelectConcept={handleSelectConcept}
          />

          {/* Class-wide mastery by concept */}
          <ClassConceptMasteryChart
            concepts={data.conceptsMastery}
            selectedConceptId={selectedConceptId}
            onSelectConcept={handleSelectConcept}
          />
        </section>

        {/* Right Column: Common Misconceptions & Students Needing Support */}
        <section className="lg:col-span-6 space-y-8" aria-label="Misconception patterns & student support queue">
          {/* Common misconception patterns and counts */}
          <CommonMisconceptionsSection
            misconceptions={data.commonMisconceptions}
            selectedMisconceptionId={selectedMisconceptionId}
            onSelectMisconception={handleSelectMisconception}
          />

          {/* Students who may need support using visible demo threshold */}
          <StudentsNeedingSupportSection
            students={data.studentsNeedingSupport}
            threshold={data.supportThreshold}
            onOpenWorkbench={handleOpenWorkbench}
            onOpenStudioQuestion={handleOpenStudioQuestion}
          />
        </section>
      </div>

      {/* 4. Sliding / Contextual Detail Panel for Selected Concept or Misconception */}
      <TeacherDetailPanel
        selectedConcept={activeConcept}
        selectedMisconception={activeMisconception}
        onClose={handleCloseDetail}
        onOpenWorkbench={handleOpenWorkbench}
        onOpenStudioQuestion={handleOpenStudioQuestion}
      />
    </main>
  );
};
