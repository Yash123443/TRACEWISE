import { useEffect, useState } from 'react'
import { TracewiseApi } from '../../services/apiService'

export function ConceptMapScreen({ onSelectConceptToLearn }: { onSelectConceptToLearn: (name: string) => void }) {
  const [concepts, setConcepts] = useState<Awaited<ReturnType<typeof TracewiseApi.getConcepts>>>([])
  const [history, setHistory] = useState<Awaited<ReturnType<typeof TracewiseApi.getHistory>>>([])
  const [misconceptions, setMisconceptions] = useState<Awaited<ReturnType<typeof TracewiseApi.getMisconceptions>>>([])
  const [diagnostic, setDiagnostic] = useState<Awaited<ReturnType<typeof TracewiseApi.getDiagnosticStatus>> | null>(null)
  const [queue, setQueue] = useState<Awaited<ReturnType<typeof TracewiseApi.getRevisionQueue>> | null>(null)
  const [recommendation, setRecommendation] = useState<Awaited<ReturnType<typeof TracewiseApi.getNextQuestion>> | null>(null)
  useEffect(() => { Promise.all([TracewiseApi.getConcepts(), TracewiseApi.getHistory(), TracewiseApi.getMisconceptions(), TracewiseApi.getDiagnosticStatus(), TracewiseApi.getRevisionQueue(), TracewiseApi.getNextQuestion()]).then(([c,h,m,d,q,n]) => { setConcepts(c); setHistory(h); setMisconceptions(m); setDiagnostic(d); setQueue(q); setRecommendation(n) }).catch(() => {}) }, [])
  if (!diagnostic || !queue || !recommendation) return <main className="p-8">Loading concept map…</main>
  return <main className="mx-auto max-w-6xl space-y-5 p-8"><h1 className="text-2xl font-bold">Concept map</h1><p>Diagnostic: {diagnostic.answered} of {diagnostic.total} answered · {diagnostic.complete ? 'complete' : 'in progress'} · Recommended next: {recommendation.question.prompt.split('\n')[0]} ({recommendation.difficulty}) — {recommendation.reason}</p>
    <div className="grid gap-3 md:grid-cols-2">{concepts.map(({concept, mastery}) => <article key={concept.id} className="rounded border bg-white p-4"><button onClick={() => onSelectConceptToLearn(concept.name)} className="font-semibold underline">{concept.name}</button><p>{mastery.mastery === null ? 'Not assessed yet' : `${Math.round(mastery.mastery*100)}% · ${mastery.status}`}</p><p>{concept.description}</p><p className="text-sm">Prerequisites: {concept.prerequisites.map((p)=>`${p.conceptId} (${p.type})`).join(', ') || 'None'}</p><p className="text-sm">Misconception records: {misconceptions.filter((m)=>concept.misconceptionCodes.includes(m.code)).map((m)=>`${TracewiseApi.misconceptionName(m.code) ?? m.code} (${m.status})`).join(', ') || 'None'}</p><p className="text-xs text-stone-500">History entries: {history.filter((h)=>h.conceptId===concept.id).length} · Revisions: {[...queue.due,...queue.upcoming].filter((r)=>r.conceptId===concept.id).length}</p></article>)}</div>
  </main>
}
