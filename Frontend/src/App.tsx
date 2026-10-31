import { useState, useEffect } from 'react';
import type { NavigationTab } from './types/tracewise';
import { AppHeader } from './components/layout/AppHeader';
import { StudentOverviewScreen } from './components/overview/StudentOverviewScreen';
import { LearningStudioScreen } from './components/studio/LearningStudioScreen';
import { InteractiveMemoryWorkbench } from './components/workbench/InteractiveMemoryWorkbench';
import { ConceptMapScreen } from './components/conceptMap/ConceptMapScreen';
import { RevisionScreen } from './components/revision/RevisionScreen';
import { TeacherScreen } from './components/teacher/TeacherScreen';
import { LandingPage } from './components/landing/LandingPage';
import type { UiSimulationState } from './components/common/StateSwitcher';
import { ShortcutsModal } from './components/common/ShortcutsModal';
import { TracewiseApi } from './services/apiService';
import type { StudentOverviewData } from './services/apiService';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { DEMO_LEARNING_QUESTIONS } from './mock/demoData';
import type { LearningQuestion } from './types/tracewise';

export function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('landing');
  const [uiState, setUiState] = useState<UiSimulationState>('ready');
  const [overviewData, setOverviewData] = useState<StudentOverviewData | null>(null);
  const [questionBank, setQuestionBank] = useState<LearningQuestion[]>(DEMO_LEARNING_QUESTIONS);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>(
    DEMO_LEARNING_QUESTIONS[0].id
  );

  // Fetch initial student overview data
  const loadOverviewData = async () => {
    try {
      const [res, bank] = await Promise.all([TracewiseApi.getStudentOverview(), TracewiseApi.getQuestions()]);
      setOverviewData(res.data);
      setQuestionBank(bank.data);
      setSelectedQuestionId((current) => bank.data.some((question) => question.id === current)
        ? current
        : res.data.nextAction.questionId);
    } catch (e) {
      console.error(e);
      setUiState('error');
    }
  };

  useEffect(() => {
    loadOverviewData();
  }, []);

  // Keyboard navigation shortcuts
  useKeyboardShortcuts({
    activeTab,
    onNavigate: (tab) => setActiveTab(tab),
    onCloseModals: () => {
      setShortcutsModalOpen(false);
      setMobileMenuOpen(false);
    },
    onToggleShortcutsModal: () => setShortcutsModalOpen((prev) => !prev),
  });

  const handleStartLearning = (questionId?: string) => {
    if (questionId) {
      setSelectedQuestionId(questionId);
    }
    setActiveTab('learn');
  };

  const handleSelectConceptToLearn = (conceptName: string) => {
    const matched = questionBank.find((q) =>
      q.title.toLowerCase().includes(conceptName.toLowerCase())
    );
    setSelectedQuestionId(matched?.id ?? overviewData?.nextAction.questionId ?? questionBank[0]?.id ?? DEMO_LEARNING_QUESTIONS[0].id);
    setActiveTab('learn');
  };

  const currentQuestion = questionBank.find((q) => q.id === selectedQuestionId) || questionBank[0] || DEMO_LEARNING_QUESTIONS[0];

  const dueCount = overviewData?.dueRevisions.length ?? 3;

  return (
    <div className="min-h-screen flex flex-col bg-[#fbfbfa] text-stone-900 selection:bg-stone-200 selection:text-stone-900 relative overflow-x-hidden">
      {/* Top Application Shell Header */}
      <AppHeader
        activeTab={activeTab}
        onNavigate={setActiveTab}
        mobileMenuOpen={mobileMenuOpen}
        onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        onOpenShortcuts={() => setShortcutsModalOpen(true)}
        dueRevisionCount={dueCount}
      />

      {/* Main Routed Content Area */}
      <div className="flex-1 pb-16">
        {activeTab === 'landing' && (
          <LandingPage
            onNavigate={setActiveTab}
            onSelectQuestion={setSelectedQuestionId}
          />
        )}

        {activeTab === 'overview' && overviewData && (
          <StudentOverviewScreen
            overviewData={overviewData}
            uiState={uiState}
            onStartLearning={handleStartLearning}
            onOpenWorkbench={() => setActiveTab('workbench')}
            onRetry={loadOverviewData}
          />
        )}

        {activeTab === 'learn' && (
          <LearningStudioScreen
            initialQuestion={currentQuestion}
            questionBank={questionBank}
            uiState={uiState}
            onRetry={loadOverviewData}
            onOpenWorkbench={() => setActiveTab('workbench')}
          />
        )}

        {activeTab === 'workbench' && (
          <InteractiveMemoryWorkbench />
        )}

        {activeTab === 'concept-map' && (
          <ConceptMapScreen onSelectConceptToLearn={handleSelectConceptToLearn} />
        )}

        {activeTab === 'revision' && (
          <RevisionScreen
            onStartRevision={handleStartLearning}
            uiState={uiState}
            onRetry={loadOverviewData}
          />
        )}

        {activeTab === 'teacher' && (
          <TeacherScreen
            uiState={uiState}
            onNavigateToTab={setActiveTab}
            onSelectQuestion={setSelectedQuestionId}
          />
        )}
      </div>

      {/* Keyboard Shortcuts Help Dialog */}
      <ShortcutsModal
        isOpen={shortcutsModalOpen}
        onClose={() => setShortcutsModalOpen(false)}
      />
    </div>
  );
}

export default App;
