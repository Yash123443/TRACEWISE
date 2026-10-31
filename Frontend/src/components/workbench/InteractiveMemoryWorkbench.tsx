import { useEffect, useState } from 'react'
import { getReplaySetup } from '@engine/evaluation'
import { questions } from '@engine/data'
import { correctInsertAtHead } from '@engine/simulator'
import type { Operation, Trace } from '@engine/contracts'
import { TracewiseApi } from '../../services/apiService'
import type { MemorySnapshot, OperationStep } from '../../types/workbenchTrace'
import { LinkedListVisualizer2D } from './LinkedListVisualizer2D'
import { MemoryVisualizer3DPlaceholder } from './MemoryVisualizer3DPlaceholder'
import { OperationTreeStepper } from './OperationTreeStepper'

const readableTraceText = (text: string) => text.replace(/\bnull\b/gi, 'no node')

export function InteractiveMemoryWorkbench({ questionId, studentTrace }: { questionId?: string; studentTrace?: Trace }) {
  const replayQuestions = questions.filter((question) => question.supportsReplay)
  const [selectedQuestionId, setSelectedQuestionId] = useState(questionId && getReplaySetup(questionId) ? questionId : replayQuestions[0]?.id ?? '')
  const activeQuestionId = selectedQuestionId
  const setup = getReplaySetup(activeQuestionId)
  const [operations, setOperations] = useState<Operation[]>([])
  const [reference, setReference] = useState<Trace | null>(null)
  const [learnerTrace, setLearnerTrace] = useState<Trace | null>(null)
  const [step, setStep] = useState(0)
  const [view, setView] = useState<'2d'|'3d'>('2d')
  const [playing, setPlaying] = useState(false)
  const trace=learnerTrace ?? reference
  useEffect(() => { if (questionId && getReplaySetup(questionId)) setSelectedQuestionId(questionId) }, [questionId])
  useEffect(() => { setOperations([]); setStep(0); setLearnerTrace(studentTrace ?? null); if (setup) void Promise.resolve(TracewiseApi.runReplay(correctInsertAtHead(setup.newNode), setup.initial)).then(setReference) }, [activeQuestionId, studentTrace])
  const run = async (op: Operation) => { if (!setup) return; const next=[...operations,op]; setOperations(next); setLearnerTrace(await TracewiseApi.runReplay(next, setup.initial)); setStep(next.length) }
  const undo = async () => { if (!setup || !operations.length) return; const next=operations.slice(0,-1); setOperations(next); setLearnerTrace(await TracewiseApi.runReplay(next,setup.initial)); setStep(Math.max(0,next.length)) }
  useEffect(()=>{ if(!playing || !trace) return; const timer=window.setInterval(()=>setStep((current)=>{if(current>=trace.steps.length-1){setPlaying(false);return current}return current+1}),1200);return()=>window.clearInterval(timer)},[playing,trace])
  if (!setup) return <main className="p-8">Choose a replay question to see its reference trace.</main>
  const frame=trace?.steps[Math.min(step, Math.max(0, (trace?.steps.length ?? 1)-1))]
  const frames: OperationStep[] = (trace?.steps ?? []).map((f) => {
    const ids = new Map(Object.keys(f.nodes).map((name) => [name, `node-${name}`]))
    const snapshot: MemorySnapshot = {
      nodes: Object.entries(f.nodes).map(([name, node]) => ({ id: ids.get(name)!, val: name, memoryAddress: 'engine-managed', nextId: node.next ? ids.get(node.next) ?? null : null, status: f.unreachable.includes(name) ? 'unreachable' : name === setup.newNode ? 'allocated' : 'linked', isHeadTarget: f.head === name })),
      pointers: [{ name: 'head', targetNodeId: f.head ? ids.get(f.head) ?? null : null, color: '#0d9488' }, { name: 'newNode', targetNodeId: ids.get(setup.newNode) ?? null, color: '#2563eb' }],
      headTargetId: f.head ? ids.get(f.head) ?? null : null, unreachableNodeIds: f.unreachable.map((name) => ids.get(name) ?? name), hasCycle: f.note.toLowerCase().includes('cycle'), invariantStatus: trace?.error ? 'flawed' : 'in-progress', invariantNote: trace?.error ?? f.note,
    }
    return { stepIndex: f.index, label: `Step ${f.index + 1}`, codeInstruction: readableTraceText(JSON.stringify(f.operation)), description: readableTraceText(f.note), targetPointersAffected: [f.operation.op], snapshot }
  })
  const snapshot = frames[step]?.snapshot
  return <main className="mx-auto max-w-5xl space-y-5 p-8"><h1 className="text-2xl font-bold">Interactive memory workbench</h1><label>Replay question: <select value={activeQuestionId} onChange={(e)=>setSelectedQuestionId(e.target.value)}>{replayQuestions.map((q)=><option key={q.id} value={q.id}>{q.prompt.split('\n')[0]}</option>)}</select></label><p>{learnerTrace ? 'Learner trace' : 'Reference trace'} · initial list: {setup.initial.list.join(' → ')} · head: {setup.initial.head} · new node: {setup.newNode}</p>
    <div className="flex flex-wrap gap-2"><button className="rounded border px-3 py-2" onClick={()=>void run({op:'allocate',node:setup.newNode,source_text:'allocate new node'})}>Allocate new node</button><button className="rounded border px-3 py-2" onClick={()=>void run({op:'set_next',node:setup.newNode,target:setup.initial.head ?? 'null',source_text:'link new node to old head'})}>Link new node to old head</button><button className="rounded border px-3 py-2" onClick={()=>void run({op:'set_head',target:setup.newNode,source_text:'move head to new node'})}>Move head to new node</button><button className="rounded border px-3 py-2" onClick={()=>void undo()}>Undo</button><button className="rounded border px-3 py-2" onClick={()=>{setPlaying(false);setOperations([]);setLearnerTrace(null);setStep(0)}}>Reset</button></div>
    {trace?.error && <p role="alert" className="text-rose-700">{trace.error}</p>}
    {snapshot && <section className="space-y-3"><div className="flex gap-2"><button className="rounded border px-3 py-1" onClick={()=>setView('2d')}>2D</button><button className="rounded border px-3 py-1" onClick={()=>setView('3d')}>3D</button></div>{view==='2d'?<LinkedListVisualizer2D snapshot={snapshot} activeStepLabel={`Frame ${step+1}`} />:<MemoryVisualizer3DPlaceholder snapshot={snapshot} activeStepLabel={`Frame ${step+1}`} />}<div className="rounded border bg-white p-4"><p>Step {frame?.index}: {readableTraceText(frame?.note ?? '')}</p><p>Head: {frame?.head ?? 'no node'}</p><p>Reachable: {frame?.reachable.join(' → ') || 'none'}</p><p>Unreachable: {frame?.unreachable.join(', ') || 'none'}</p><div className="flex gap-2"><button onClick={()=>setStep((s)=>Math.max(0,s-1))}>Previous</button><button onClick={()=>setStep((s)=>Math.min((trace?.steps.length??1)-1,s+1))}>Next</button><button onClick={()=>setPlaying((p)=>!p)}>{playing?'Pause':'Play'}</button></div><input aria-label="Trace frame" type="range" min={0} max={Math.max(0,(trace?.steps.length ?? 1)-1)} value={step} onChange={(e)=>setStep(Number(e.target.value))} /></div><OperationTreeStepper steps={frames} currentStepIndex={Math.min(step,Math.max(0,frames.length-1))} onSelectStep={setStep} /></section>}
    {reference && <details><summary>Reference trace comparison</summary><p>Reference final list: {reference.final_list.join(' → ')}</p><p>Current trace final list: {trace?.final_list.join(' → ') ?? 'unavailable'}</p>{reference.steps.map((f)=><p key={f.index}>Step {f.index}: head {f.head ?? 'no node'}; reachable {f.reachable.join(' → ') || 'none'}; unreachable {f.unreachable.join(', ') || 'none'}</p>)}</details>}
  </main>
}
