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
import { Button } from '../common/Button'
import { Card, CardBody, CardHeader } from '../common/Card'

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
  const run = async (op: Operation) => { if (!setup) return; const next=[...operations,op]; setOperations(next); setLearnerTrace(await TracewiseApi.runReplay(next, setup.initial)); setStep(Math.max(0, next.length - 1)) }
  const undo = async () => { if (!setup || !operations.length) return; const next=operations.slice(0,-1); setOperations(next); setLearnerTrace(await TracewiseApi.runReplay(next,setup.initial)); setStep(Math.max(0, next.length - 1)) }
  useEffect(()=>{ if(!playing || !trace) return; const timer=window.setInterval(()=>setStep((current)=>{if(current>=trace.steps.length-1){setPlaying(false);return current}return current+1}),1200);return()=>window.clearInterval(timer)},[playing,trace])
  if (!setup) return <main className="p-8">Choose a replay question to see its reference trace.</main>
  const frame=trace?.steps[Math.min(step, Math.max(0, (trace?.steps.length ?? 1)-1))]
  const frames: OperationStep[] = (trace?.steps ?? []).map((f) => {
    const ids = new Map(Object.keys(f.nodes).map((name) => [name, `node-${name}`]))
    const snapshot: MemorySnapshot = {
      nodes: Object.entries(f.nodes).map(([name, node]) => ({ id: ids.get(name)!, val: name, nextId: node.next ? ids.get(node.next) ?? null : null, status: f.unreachable.includes(name) ? 'unreachable' : name === setup.newNode ? 'allocated' : 'linked', isHeadTarget: f.head === name })),
      pointers: [{ name: 'head', targetNodeId: f.head ? ids.get(f.head) ?? null : null, color: '#0d9488' }, { name: 'newNode', targetNodeId: ids.get(setup.newNode) ?? null, color: '#2563eb' }],
      headTargetId: f.head ? ids.get(f.head) ?? null : null, unreachableNodeIds: f.unreachable.map((name) => ids.get(name) ?? name), hasCycle: f.note.toLowerCase().includes('cycle'), invariantStatus: trace?.error ? 'flawed' : 'in-progress', invariantNote: trace?.error ?? f.note,
    }
    return { stepIndex: f.index, label: `Step ${f.index + 1}`, codeInstruction: readableTraceText(JSON.stringify(f.operation)), description: readableTraceText(f.note), targetPointersAffected: [f.operation.op], snapshot }
  })
  const snapshot = frames[Math.min(step, Math.max(0, frames.length - 1))]?.snapshot
  return <main className="mx-auto max-w-5xl space-y-5 p-8"><h1 className="text-2xl font-bold">Interactive memory workbench</h1><label>Replay question: <select value={activeQuestionId} onChange={(e)=>setSelectedQuestionId(e.target.value)}>{replayQuestions.map((q)=><option key={q.id} value={q.id}>{q.prompt.split('\n')[0]}</option>)}</select></label><p>{learnerTrace ? 'Learner trace' : 'Reference trace'} · initial list: {setup.initial.list.join(' → ')} · head: {setup.initial.head} · new node: {setup.newNode}</p>
    <div className="flex flex-wrap gap-2"><Button type="button" variant="secondary" size="sm" onClick={()=>void run({op:'allocate',node:setup.newNode,source_text:'allocate new node'})}>Allocate new node</Button><Button type="button" variant="secondary" size="sm" onClick={()=>void run({op:'set_next',node:setup.newNode,target:setup.initial.head ?? 'null',source_text:'link new node to old head'})}>Link new node to old head</Button><Button type="button" variant="secondary" size="sm" onClick={()=>void run({op:'set_head',target:setup.newNode,source_text:'move head to new node'})}>Move head to new node</Button><Button type="button" variant="outline" size="sm" onClick={()=>void undo()} disabled={!operations.length}>Undo</Button><Button type="button" variant="outline" size="sm" onClick={()=>{setPlaying(false);setOperations([]);setLearnerTrace(null);setStep(0)}}>Reset</Button></div>
    {trace?.error && <p role="alert" className="text-rose-700">{trace.error}</p>}
    {snapshot && <section className="space-y-3"><div className="flex gap-2"><Button type="button" size="sm" variant={view==='2d'?'primary':'outline'} aria-pressed={view==='2d'} onClick={()=>setView('2d')}>2D</Button><Button type="button" size="sm" variant={view==='3d'?'primary':'outline'} aria-pressed={view==='3d'} onClick={()=>setView('3d')}>3D</Button></div>{view==='2d'?<LinkedListVisualizer2D snapshot={snapshot} activeStepLabel={`Frame ${step+1}`} />:<MemoryVisualizer3DPlaceholder snapshot={snapshot} activeStepLabel={`Frame ${step+1}`} />}<Card className="border-stone-200 bg-white shadow-xs"><CardHeader className="bg-stone-50/70"><h2 className="text-sm font-semibold">Current step <span className="ml-2 rounded-full bg-stone-900 px-2 py-1 text-xs text-white">{step+1} of {trace?.steps.length ?? 0}</span></h2></CardHeader><CardBody className="space-y-2"><p>{readableTraceText(frame?.note ?? '')}</p><p>Head: {frame?.head ?? 'no node'}</p><p>Reachable: {frame?.reachable.join(' → ') || 'none'}</p><p>Unreachable: {frame?.unreachable.join(', ') || 'none'}</p><div className="flex flex-wrap gap-2"><Button type="button" size="sm" variant="outline" onClick={()=>setStep((s)=>Math.max(0,s-1))} disabled={step===0}>Previous</Button><Button type="button" size="sm" variant="outline" onClick={()=>setStep((s)=>Math.min((trace?.steps.length??1)-1,s+1))} disabled={step>=((trace?.steps.length??1)-1)}>Next</Button><Button type="button" size="sm" variant="secondary" onClick={()=>setPlaying((p)=>!p)}>{playing?'Pause':'Play'}</Button></div><input className="w-full accent-stone-900" aria-label="Trace frame" type="range" min={0} max={Math.max(0,(trace?.steps.length ?? 1)-1)} value={step} onChange={(e)=>setStep(Number(e.target.value))} /></CardBody></Card><OperationTreeStepper steps={frames} currentStepIndex={Math.min(step,Math.max(0,frames.length-1))} onSelectStep={setStep} /></section>}
    {reference && <details><summary>Reference trace comparison</summary><p>Reference final list: {reference.final_list.join(' → ')}</p><p>Current trace final list: {trace?.final_list.join(' → ') ?? 'unavailable'}</p>{reference.steps.map((f)=><p key={f.index}>Step {f.index}: head {f.head ?? 'no node'}; reachable {f.reachable.join(' → ') || 'none'}; unreachable {f.unreachable.join(', ') || 'none'}</p>)}</details>}
  </main>
}
