import { useEffect, useState } from 'react'
import { concepts, misconceptions } from '@engine/data'
import { TracewiseApi } from '../../services/apiService'

export function TeacherScreen() {
  const [data, setData] = useState<Awaited<ReturnType<typeof TracewiseApi.getTeacherAnalytics>> | null>(null)
  useEffect(() => { TracewiseApi.getTeacherAnalytics().then(setData).catch(() => setData(null)) }, [])
  if (!data) return <main className="p-8">Loading simulated class analytics…</main>
  return <main className="mx-auto max-w-6xl space-y-5 p-8"><h1 className="text-2xl font-bold">Teacher analytics</h1><strong>Simulated class data (generated for demo, not real students)</strong><p>Data source: {data.dataSource} · {data.learnerCount} learners</p><p>Attention threshold: {Math.round(data.attentionThreshold*100)}%. Engine flags learners for assessed average below 40%, at least three concepts below 40%, or recurring misconceptions.</p>
    <section><h2 className="text-lg font-semibold">Concept averages</h2>{concepts.map((c)=>{const score=data.conceptMastery.find((x)=>x.conceptId===c.id);return <p key={c.id}>{c.name}: {score ? `${Math.round(score.average*100)}%` : 'Not assessed'}</p>})}</section>
    <section><h2 className="text-lg font-semibold">Top misconceptions</h2>{data.topMisconceptions.length ? data.topMisconceptions.map((item)=><p key={item.code}>{misconceptions.find((m)=>m.code===item.code)?.name ?? item.code}: {item.count}</p>) : <p>None recorded.</p>}</section>
    <section><h2 className="text-lg font-semibold">Learners needing attention</h2>{data.learnersNeedingAttention.length ? data.learnersNeedingAttention.map((item)=><p key={item.learnerId}>{item.learnerId}: {item.reason}</p>) : <p>None flagged.</p>}</section>
    <section><h2 className="text-lg font-semibold">Draft grounded in the class data above</h2>{data.reteachOutline.length ? data.reteachOutline.map((line,i)=><p key={i}>{line}</p>) : <p>No reteach outline is available.</p>}</section>
  </main>
}
