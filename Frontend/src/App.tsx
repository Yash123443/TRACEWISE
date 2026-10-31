import { useEffect, useState } from 'react'
import type { NavigationTab, LearningQuestion } from './types/tracewise'
import { TracewiseApi } from './services/apiService'
import { AppHeader } from './components/layout/AppHeader'
import { LearningStudioScreen } from './components/studio/LearningStudioScreen'
import { StudentOverviewScreen } from './components/overview/StudentOverviewScreen'
import { PracticePathScreen } from './components/overview/PracticePathScreen'
import { ConceptMapScreen } from './components/conceptMap/ConceptMapScreen'
import { RevisionScreen } from './components/revision/RevisionScreen'
import { TeacherScreen } from './components/teacher/TeacherScreen'
import { InteractiveMemoryWorkbench } from './components/workbench/InteractiveMemoryWorkbench'
import { LandingPage } from './components/landing/LandingPage'
import { ShortcutsModal } from './components/common/ShortcutsModal'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import type { Trace } from '@engine/contracts'

export default function App() {
  const [tab, setTab] = useState<NavigationTab>('landing')
  const [questions, setQuestions] = useState<LearningQuestion[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dueCount, setDueCount] = useState(0)
  const [refreshVersion, setRefreshVersion] = useState(0)
  const [shortcuts, setShortcuts] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [submittedTrace, setSubmittedTrace] = useState<{ questionId: string; trace: Trace } | null>(null)
  const refresh = async () => {
    setRefreshVersion((v) => v + 1)
    setLoading(true); setError(null)
    try {
      const [q, bank, queue] = await Promise.all([TracewiseApi.getQuestions(), TracewiseApi.getPracticeQuestions(), TracewiseApi.getRevisionQueue()])
      const availableQuestions = [...bank, ...q.filter((item) => !bank.some((candidate) => candidate.id === item.id))]
      setQuestions(availableQuestions)
      setSelectedId((id) => {
        if (id?.startsWith('diag_')) return q.some((item) => item.id === id) ? id : q[0]?.id ?? availableQuestions[0]?.id ?? ''
        return availableQuestions.some((item) => item.id === id) ? id : q[0]?.id ?? availableQuestions[0]?.id ?? ''
      })
      setDueCount(queue.due.length)
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not load engine data.') } finally { setLoading(false) }
  }
  useEffect(() => { void refresh() }, [])
  useKeyboardShortcuts({ activeTab: tab, onNavigate: setTab, onCloseModals: () => setShortcuts(false), onToggleShortcutsModal: () => setShortcuts((v) => !v) })
  const openQuestion = async (id?: string) => {
    if (id) {
      setSelectedId(id)
      if (!questions.some((q) => q.id === id)) {
        try { const q = await TracewiseApi.getQuestion(id); setQuestions((items) => [...items, q]) } catch { /* global error is surfaced on refresh */ }
      }
    }
    setTab('learn')
  }
  const selected = questions.find((q) => q.id === selectedId)
  return <div className="min-h-screen bg-[#fbfbfa] text-stone-900">
    <AppHeader activeTab={tab} onNavigate={setTab} mobileMenuOpen={mobileMenuOpen} onToggleMobileMenu={() => setMobileMenuOpen((v) => !v)} onOpenShortcuts={() => setShortcuts(true)} dueRevisionCount={dueCount} />
    {error && <div role="alert" className="m-4 rounded bg-rose-50 p-3 text-rose-800">{error} <button onClick={() => void refresh()}>Retry</button></div>}
    {tab === 'landing' && <LandingPage onNavigate={setTab} onSelectQuestion={setSelectedId} />}
    {tab === 'overview' && <StudentOverviewScreen key={refreshVersion} loading={loading} onStartLearning={openQuestion} onRefresh={refresh} />}
    {tab === 'learn' && (selected ? <LearningStudioScreen key={`${selected.id}:${refreshVersion}`} initialQuestion={selected} questionBank={questions} uiState="ready" onRetry={refresh} onQuestionChange={setSelectedId} onTrace={(trace) => setSubmittedTrace({ questionId: selected.id, trace })} hasReplayTrace={submittedTrace?.questionId === selected.id && Boolean(submittedTrace.trace)} onViewMemoryReplay={() => setTab('workbench')} onOpenWorkbench={() => setTab('workbench')} /> : <p className="p-8">No diagnostic question is available yet.</p>)}
    {tab === 'concept-map' && <ConceptMapScreen key={refreshVersion} onSelectConceptToLearn={(name) => { const match = questions.find((q) => q.category.includes(name)); void openQuestion(match?.id) }} />}
    {tab === 'revision' && <RevisionScreen key={refreshVersion} onStartRevision={(id) => void openQuestion(id)} onRefresh={refresh} />}
    {tab === 'teacher' && <TeacherScreen key={refreshVersion} />}
    {tab === 'practice' && <PracticePathScreen onStartLearning={(id) => void openQuestion(id)} />}
    {tab === 'workbench' && <InteractiveMemoryWorkbench key={refreshVersion} questionId={selectedId} studentTrace={submittedTrace?.questionId === selectedId ? submittedTrace.trace : undefined} />}
    <ShortcutsModal isOpen={shortcuts} onClose={() => setShortcuts(false)} />
  </div>
}
