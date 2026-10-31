import { useEffect, useState } from 'react'
import { TracewiseApi } from '../../services/apiService'
import { Card, CardBody, CardHeader } from '../common/Card'
import { Button } from '../common/Button'

const masteryLabel = (status: string) => ({ strong: 'Strong', developing: 'Developing', due: 'Due for review', not_assessed: 'Not assessed yet' }[status] ?? 'Not assessed yet')

export function StudentOverviewScreen({ loading, onStartLearning, onRefresh }: { loading: boolean; onStartLearning: (id?: string) => void; onRefresh: () => void }) {
  const [data, setData] = useState<Awaited<ReturnType<typeof TracewiseApi.getConcepts>> | null>(null)
  const [history, setHistory] = useState<Awaited<ReturnType<typeof TracewiseApi.getHistory>>>([])
  const [queue, setQueue] = useState<Awaited<ReturnType<typeof TracewiseApi.getRevisionQueue>> | null>(null)
  const [diagnostic, setDiagnostic] = useState<Awaited<ReturnType<typeof TracewiseApi.getDiagnosticStatus>> | null>(null)
  const [recommendation, setRecommendation] = useState<Awaited<ReturnType<typeof TracewiseApi.getNextQuestion>> | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  useEffect(() => {
    let active = true
    Promise.all([TracewiseApi.getConcepts(), TracewiseApi.getHistory(), TracewiseApi.getRevisionQueue(), TracewiseApi.getDiagnosticStatus(), TracewiseApi.getNextQuestion()])
      .then(([concepts, attempts, revisions, status, next]) => {
        if (!active) return
        setData(concepts); setHistory(attempts); setQueue(revisions); setDiagnostic(status); setRecommendation(next); setLoadError(null)
      })
      .catch((error: unknown) => { if (active) setLoadError(error instanceof Error ? error.message : 'Could not load learner state.') })
    return () => { active = false }
  }, [])
  if (loading || !data || !queue || !diagnostic || !recommendation) return <main className="mx-auto max-w-6xl space-y-5 p-6 sm:p-8"><h1 className="text-2xl font-bold">Learner overview</h1>{loadError ? <Card><CardBody><p role="alert" className="text-rose-800">{loadError}</p><Button className="mt-3" variant="outline" onClick={onRefresh}>Retry</Button></CardBody></Card> : <p role="status">Loading learner state…</p>}</main>
  return <main className="mx-auto max-w-6xl space-y-5 p-6 sm:p-8">
    <h1 className="text-2xl font-bold">Learner overview</h1>
    <Card><CardBody className="flex flex-wrap items-center justify-between gap-4">
      <p>Diagnostic: {diagnostic.answered}/{diagnostic.total} answered · Next: {recommendation.question.prompt.split('\n')[0]} ({recommendation.difficulty}) · {recommendation.reason}</p>
      <div className="flex flex-wrap gap-2"><Button type="button" onClick={() => onStartLearning()} variant="primary">Continue learning</Button><Button type="button" onClick={() => onStartLearning('diag_linked_lists_head_insert')} variant="secondary">Try the linked-list replay question</Button><Button type="button" onClick={onRefresh} variant="outline">Refresh</Button></div>
    </CardBody></Card>
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">Concept mastery</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {data.map(({ concept, mastery }) => {
          const percentage = mastery.mastery === null ? null : Math.round(mastery.mastery * 100)
          return <Card key={concept.id} className="shadow-xs"><CardBody className="space-y-3">
            <div className="flex items-start justify-between gap-3"><h3 className="font-semibold text-stone-900">{concept.name}</h3><span className="text-xs text-stone-600">{percentage === null ? 'Not assessed yet' : `${percentage}% · ${masteryLabel(mastery.status)}`}</span></div>
            {percentage !== null && <div role="progressbar" aria-label={`${concept.name} mastery`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percentage} className="h-2 overflow-hidden rounded-full bg-stone-100"><div className="h-full rounded-full bg-teal-700" style={{ width: `${percentage}%` }} /></div>}
            <p className="text-sm text-stone-600">Prerequisites: {concept.prerequisites.map((item) => `${TracewiseApi.conceptName(item.conceptId)} (${item.type})`).join(', ') || 'None'}</p>
          </CardBody></Card>
        })}
      </div>
    </section>
    <section className="grid gap-4 md:grid-cols-2">
      <Card><CardHeader><h2 className="font-semibold">Revision queue</h2></CardHeader><CardBody className="space-y-2">{[...queue.due, ...queue.upcoming].length ? [...queue.due, ...queue.upcoming].map((task) => <p key={task.id}>{TracewiseApi.conceptName(task.conceptId)}: {task.reason} · priority {task.priority}</p>) : <p>No scheduled revisions.</p>}</CardBody></Card>
      <Card><CardHeader><h2 className="font-semibold">Recorded history</h2></CardHeader><CardBody className="space-y-2">{history.length ? history.slice(0, 5).map((entry) => <p key={entry.id}>{TracewiseApi.conceptName(entry.conceptId)}: {entry.reason}</p>) : <p>No attempts recorded.</p>}</CardBody></Card>
    </section>
    <footer className="space-y-1 border-t border-stone-200 pt-4 text-xs text-stone-600">
      <p>Teacher class data is simulated.</p>
      <p>Voice is Wispr Flow dictation into the text box; there is no Wispr Flow API integration.</p>
    </footer>
  </main>
}
