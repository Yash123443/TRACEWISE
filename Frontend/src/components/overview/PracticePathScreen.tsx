import { useEffect, useState } from 'react'
import { TracewiseApi } from '../../services/apiService'
import { GuidedPracticePath } from './GuidedPracticePath'
import { Button } from '../common/Button'

export function PracticePathScreen({ onStartLearning }: { onStartLearning: (id: string) => void }) {
  const [history, setHistory] = useState<Awaited<ReturnType<typeof TracewiseApi.getHistory>>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadHistory = () => {
    setLoading(true)
    void TracewiseApi.getHistory()
      .then(setHistory)
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Could not load practice progress.'))
      .finally(() => setLoading(false))
  }

  useEffect(loadHistory, [])

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <header className="space-y-2 border-b border-stone-200 pb-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">Student practice</p>
        <h1 className="text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">Guided 20-question path</h1>
        <p className="max-w-3xl text-sm leading-relaxed text-stone-600">
          All questions use the existing engine question bank and evaluation. Choose any question, practice in any order, and return here to continue.
        </p>
      </header>
      {error && (
        <div role="alert" className="flex items-center justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          <span>{error}</span>
          <Button type="button" variant="outline" size="sm" onClick={loadHistory}>Retry</Button>
        </div>
      )}
      {loading ? (
        <p role="status" className="text-sm text-stone-500">Loading practice progress…</p>
      ) : (
        <GuidedPracticePath history={history} getConceptName={TracewiseApi.conceptName} onStart={onStartLearning} />
      )}
    </main>
  )
}
