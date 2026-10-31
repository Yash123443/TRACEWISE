import { useEffect, useState } from 'react'
import { TracewiseApi } from '../../services/apiService'

export function RevisionScreen({ onStartRevision, onRefresh = () => {} }: { onStartRevision: (questionId?: string) => void; onRefresh?: () => void }) {
  const [queue, setQueue] = useState<Awaited<ReturnType<typeof TracewiseApi.getRevisionQueue>> | null>(null)
  const reload = async () => setQueue(await TracewiseApi.getRevisionQueue())
  useEffect(() => { void reload() }, [])
  const changeTime = async (days: number) => { await TracewiseApi.advanceDemoTime(days); await reload(); onRefresh() }
  const reset = async () => { if (!window.confirm('Reset the local demo learner and simulation clock?')) return; await TracewiseApi.resetDemo(); await reload(); onRefresh() }
  if (!queue) return <main className="p-8">Loading revision queue…</main>
  const items = [...queue.due, ...queue.upcoming]
  return <main className="mx-auto max-w-5xl space-y-5 p-8"><h1 className="text-2xl font-bold">Revision queue</h1><section className="rounded border bg-stone-50 p-4"><h2 className="font-semibold">Simulation control (demo only)</h2><div className="mt-2 flex gap-2"><button className="rounded border px-3 py-2" onClick={()=>void changeTime(1)}>Advance 1 day</button><button className="rounded border px-3 py-2" onClick={()=>void changeTime(3)}>Advance 3 days</button><button className="rounded border px-3 py-2" onClick={()=>void reset()}>Reset demo</button></div></section>{items.length===0?<p>No due or upcoming revision tasks.</p>:items.map((task)=><article key={task.id} className="flex items-center justify-between rounded border bg-white p-4"><div><h2 className="font-semibold">{task.conceptId} · {task.questionId}</h2><p>{task.reason}</p><p>Priority {task.priority} · {task.status}</p></div><button className="rounded bg-stone-900 px-3 py-2 text-white" onClick={()=>onStartRevision(task.questionId)}>Start review</button></article>)}</main>
}
