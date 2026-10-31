import { useEffect, useState } from 'react'
import { TracewiseApi } from '../../services/apiService'
import { Card, CardBody } from '../common/Card'
import { Button } from '../common/Button'
import { Badge } from '../common/Badge'
import { GuidedPracticePath } from './GuidedPracticePath'
import {
  Brain,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  RotateCcw,
  Sparkles,
  BookOpen,
  HelpCircle,
  Activity,
} from 'lucide-react'

export function StudentOverviewScreen({
  loading,
  onStartLearning,
  onRefresh,
}: {
  loading: boolean
  onStartLearning: (id?: string) => void
  onRefresh: () => void
}) {
  const [data, setData] = useState<Awaited<ReturnType<typeof TracewiseApi.getConcepts>> | null>(null)
  const [history, setHistory] = useState<Awaited<ReturnType<typeof TracewiseApi.getHistory>>>([])
  const [queue, setQueue] = useState<Awaited<ReturnType<typeof TracewiseApi.getRevisionQueue>> | null>(null)
  const [diagnostic, setDiagnostic] = useState<Awaited<ReturnType<typeof TracewiseApi.getDiagnosticStatus>> | null>(null)
  const [recommendation, setRecommendation] = useState<Awaited<ReturnType<typeof TracewiseApi.getNextQuestion>> | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    Promise.all([
      TracewiseApi.getConcepts(),
      TracewiseApi.getHistory(),
      TracewiseApi.getRevisionQueue(),
      TracewiseApi.getDiagnosticStatus(),
      TracewiseApi.getNextQuestion(),
    ])
      .then(([concepts, attempts, revisions, status, next]) => {
        if (!active) return
        setData(concepts)
        setHistory(attempts)
        setQueue(revisions)
        setDiagnostic(status)
        setRecommendation(next)
        setLoadError(null)
      })
      .catch((error: unknown) => {
        if (active) setLoadError(error instanceof Error ? error.message : 'Could not load learner state.')
      })
    return () => {
      active = false
    }
  }, [])

  if (loading || !data || !queue || !diagnostic || !recommendation) {
    return (
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-pulse">
        <div className="h-10 bg-stone-200 rounded w-1/3"></div>
        <div className="h-44 bg-stone-200 rounded-xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-stone-200 rounded-xl"></div>
          ))}
        </div>
        <div className="h-64 bg-stone-200 rounded-xl"></div>
      </main>
    )
  }

  const strongCount = data.filter((c) => c.mastery.status === 'strong').length
  const developingCount = data.filter((c) => c.mastery.status === 'developing').length
  const dueCount = queue.due.length
  const diagnosticProgress = Math.round((diagnostic.answered / diagnostic.total) * 100)

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900">
              Learner Reasoning Overview
            </h1>
            <Badge variant="teal" size="sm" icon={<Activity className="w-3.5 h-3.5 text-teal-700" />}>
              Active Profile
            </Badge>
          </div>
          <p className="text-sm text-stone-600 max-w-2xl">
            Track your mathematical reasoning progress, verify pointers in memory, and address memory decay through spaced repetition.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <Button type="button" variant="outline" size="sm" onClick={onRefresh} leftIcon={<RotateCcw className="w-3.5 h-3.5 text-stone-600" />}>
            Refresh State
          </Button>
        </div>
      </div>

      {loadError && (
        <div role="alert" className="p-4 rounded-xl border border-rose-200 bg-rose-50 text-xs text-rose-800 flex items-center justify-between">
          <span>{loadError}</span>
          <Button variant="outline" size="sm" onClick={onRefresh}>Retry</Button>
        </div>
      )}

      {/* 2. Hero Action Card */}
      <Card className="border-stone-200 bg-gradient-to-r from-stone-900 to-stone-800 text-white shadow-md">
        <CardBody className="p-5 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-stone-700/60 border border-stone-600 text-stone-200 text-xs font-mono">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Recommended Next Question</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              {recommendation.question.prompt.split('\n')[0]}
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              {recommendation.reason} ({recommendation.difficulty})
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-stone-400 font-mono">
              <span>Diagnostic: {diagnostic.answered} of {diagnostic.total} answered</span>
              <span>·</span>
              <span>{diagnostic.complete ? 'Diagnostic Complete' : 'Diagnostic In Progress'}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <Button
              type="button"
              variant="primary"
              size="lg"
              onClick={() => onStartLearning()}
              className="bg-white text-stone-900 hover:bg-stone-100 font-bold shadow-sm"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Continue Learning
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={() => onStartLearning('diag_linked_lists_head_insert')}
              className="bg-stone-700 hover:bg-stone-600 text-white border border-stone-600 text-xs sm:text-sm"
            >
              Try Replay Question
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* 3. Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <Card className="border-stone-200 bg-white shadow-xs">
          <CardBody className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">Strong Mastery</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-teal-700 mt-1">{strongCount}</h2>
              <span className="text-xs text-stone-500">Concepts solidified</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </CardBody>
        </Card>

        {/* Metric 2 */}
        <Card className="border-stone-200 bg-white shadow-xs">
          <CardBody className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">Developing</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 mt-1">{developingCount}</h2>
              <span className="text-xs text-stone-500">In active progression</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
              <TrendingUp className="w-6 h-6" />
            </div>
          </CardBody>
        </Card>

        {/* Metric 3 */}
        <Card className="border-stone-200 bg-white shadow-xs">
          <CardBody className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">Reviews Due</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-amber-700 mt-1">{dueCount}</h2>
              <span className="text-xs text-stone-500">Scheduled for today</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <Clock className="w-6 h-6" />
            </div>
          </CardBody>
        </Card>

        {/* Metric 4 */}
        <Card className="border-stone-200 bg-white shadow-xs">
          <CardBody className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">Diagnostic</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 mt-1">{diagnosticProgress}%</h2>
              <span className="text-xs text-stone-500">{diagnostic.answered}/{diagnostic.total} answered</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-800">
              <Brain className="w-6 h-6" />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* 4. Concept Mastery Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-stone-700" />
            <span>Concept Mastery Status</span>
          </h2>
          <span className="text-xs text-stone-500 font-mono">
            Evaluated by deterministic evidence-v1 model
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.map(({ concept, mastery }) => {
            const percentage = mastery.mastery === null ? null : Math.round(mastery.mastery * 100)
            return (
              <Card key={concept.id} className="border-stone-200 bg-white shadow-xs hover:border-stone-300 transition-all">
                <CardBody className="p-4 sm:p-5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-stone-900 text-sm">{concept.name}</h3>
                      <p className="text-xs text-stone-500 mt-0.5 line-clamp-2">{concept.description}</p>
                    </div>
                    {percentage === null ? (
                      <Badge variant="gray" size="sm" icon={<HelpCircle className="w-3 h-3 text-stone-400" />}>
                        Not assessed yet
                      </Badge>
                    ) : mastery.status === 'strong' ? (
                      <Badge variant="teal" size="sm" icon={<CheckCircle2 className="w-3 h-3 text-teal-700" />}>
                        {percentage}% · Strong
                      </Badge>
                    ) : mastery.status === 'due' ? (
                      <Badge variant="amber" size="sm" icon={<Clock className="w-3 h-3 text-amber-700" />}>
                        {percentage}% · Due
                      </Badge>
                    ) : (
                      <Badge variant="blue" size="sm">
                        {percentage}% · Developing
                      </Badge>
                    )}
                  </div>

                  {percentage !== null && (
                    <div className="space-y-1">
                      <div
                        role="progressbar"
                        aria-label={`${concept.name} mastery`}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={percentage}
                        className="h-2 overflow-hidden rounded-full bg-stone-100 border border-stone-200"
                      >
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            percentage >= 80 ? 'bg-teal-700' : 'bg-amber-600'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
                    <span>
                      Prerequisites: {concept.prerequisites.map((item) => `${TracewiseApi.conceptName(item.conceptId)} (${item.type})`).join(', ') || 'None'}
                    </span>
                    <button
                      onClick={() => onStartLearning()}
                      className="text-stone-900 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      Practice <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </CardBody>
              </Card>
            )
          })}
        </div>
      </section>

      <GuidedPracticePath
        history={history}
        getConceptName={TracewiseApi.conceptName}
        onStart={onStartLearning}
      />

      {/* 5. Dual Section: Revision Queue & Recorded History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Revision Queue */}
        <section className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-700" />
              <span>Revision Schedule</span>
            </h2>
            <span className="text-xs text-stone-500 font-mono">
              {[...queue.due, ...queue.upcoming].length} scheduled
            </span>
          </div>

          <Card className="border-stone-200 bg-white shadow-xs">
            <CardBody className="p-4 space-y-3">
              {[...queue.due, ...queue.upcoming].length === 0 ? (
                <p className="text-xs text-stone-500 py-6 text-center">No scheduled revisions right now.</p>
              ) : (
                [...queue.due, ...queue.upcoming].map((task) => (
                  <div key={task.id} className="p-3 rounded-lg border border-stone-200 bg-stone-50/50 flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-stone-900 text-xs">
                          {TracewiseApi.conceptName(task.conceptId)}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                          Priority {task.priority}
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 leading-relaxed">{task.reason}</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onStartLearning(task.questionId)}
                    >
                      Review
                    </Button>
                  </div>
                ))
              )}
            </CardBody>
          </Card>
        </section>

        {/* Recorded History */}
        <section className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-700" />
              <span>Recent Attempt Ledger</span>
            </h2>
            <span className="text-xs text-stone-500 font-mono">
              {history.length} logged attempts
            </span>
          </div>

          <Card className="border-stone-200 bg-white shadow-xs">
            <CardBody className="p-4 space-y-3">
              {history.length === 0 ? (
                <p className="text-xs text-stone-500 py-6 text-center">No recorded attempts yet. Start by answering diagnostic questions.</p>
              ) : (
                history.slice(0, 5).map((entry) => (
                  <div key={entry.id} className="p-3 rounded-lg border border-stone-200 bg-stone-50/30 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-stone-900 text-xs">
                        {TracewiseApi.conceptName(entry.conceptId)}
                      </span>
                      <span className="text-[10px] text-stone-500 font-mono">
                        {new Date(entry.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-stone-700 leading-relaxed">{entry.reason}</p>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-stone-500">
                      <span>Model: {entry.modelVersion}</span>
                    </div>
                  </div>
                ))
              )}
            </CardBody>
          </Card>
        </section>
      </div>

      {/* Footer Notes */}
      <footer className="space-y-1 border-t border-stone-200 pt-4 text-xs text-stone-500">
        <p>• Teacher class data is simulated for demo cohorts.</p>
        <p>• Voice input is Wispr Flow dictation directly into the focused text box; no third-party audio SDK is required.</p>
      </footer>
    </main>
  )
}
