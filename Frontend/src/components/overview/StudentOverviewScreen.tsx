import { useEffect, useState } from 'react'
import { TracewiseApi } from '../../services/apiService'

export function StudentOverviewScreen({ loading, onStartLearning, onRefresh }: { loading: boolean; onStartLearning: (id?: string) => void; onRefresh: () => void }) {
  const [data, setData] = useState<Awaited<ReturnType<typeof TracewiseApi.getConcepts>> | null>(null)
  const [history, setHistory] = useState<Awaited<ReturnType<typeof TracewiseApi.getHistory>>>([])
  const [queue, setQueue] = useState<Awaited<ReturnType<typeof TracewiseApi.getRevisionQueue>> | null>(null)
  const [diagnostic, setDiagnostic] = useState<Awaited<ReturnType<typeof TracewiseApi.getDiagnosticStatus>> | null>(null)
  const [recommendation, setRecommendation] = useState<Awaited<ReturnType<typeof TracewiseApi.getNextQuestion>> | null>(null)
  useEffect(() => { Promise.all([TracewiseApi.getConcepts(), TracewiseApi.getHistory(), TracewiseApi.getRevisionQueue(), TracewiseApi.getDiagnosticStatus(), TracewiseApi.getNextQuestion()]).then(([c, h, q, d, n]) => { setData(c); setHistory(h); setQueue(q); setDiagnostic(d); setRecommendation(n) }).catch(() => {}) }, [])
  if (loading || !data || !queue || !diagnostic || !recommendation) return <main className="p-8">Loading learner state…</main>
  return <main className="mx-auto max-w-6xl space-y-6 p-8">
    <h1 className="text-2xl font-bold">Learner overview</h1>
    <button className="rounded bg-stone-900 px-4 py-2 text-white" onClick={() => onStartLearning()}>Continue learning</button>
    <button className="ml-2 rounded border px-4 py-2" onClick={onRefresh}>Refresh</button>
    <p>Diagnostic: {diagnostic.answered}/{diagnostic.total} answered · Next: {recommendation.question.prompt.split('\n')[0]} ({recommendation.difficulty}) · {recommendation.reason}</p>
    <section><h2 className="mb-2 text-lg font-semibold">Concept mastery</h2><div className="grid gap-3 md:grid-cols-2">{data.map(({ concept, mastery }) => <article key={concept.id} className="rounded border bg-white p-4"><h3 className="font-semibold">{concept.name}</h3><p>{mastery.mastery === null ? 'Not assessed yet' : `${Math.round(mastery.mastery * 100)}% · ${mastery.status}`}</p><p className="text-sm text-stone-600">Prerequisites: {concept.prerequisites.map((p) => `${p.conceptId} (${p.type})`).join(', ') || 'None'}</p></article>)}</div></section>
    <section><h2 className="text-lg font-semibold">Revision queue</h2>{[...queue.due, ...queue.upcoming].length ? [...queue.due, ...queue.upcoming].map((task) => <p key={task.id}>{task.conceptId}: {task.reason} · priority {task.priority}</p>) : <p>No scheduled revisions.</p>}</section>
    <section><h2 className="text-lg font-semibold">Recorded history</h2>{history.length ? history.slice(0, 5).map((entry) => <p key={entry.id}>{entry.conceptId}: {entry.reason}</p>) : <p>No attempts recorded.</p>}</section>
  </main>
}
