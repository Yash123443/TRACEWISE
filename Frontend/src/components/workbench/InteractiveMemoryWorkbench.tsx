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
import { Badge } from '../common/Badge'
import {
  Layers,
  Box,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Undo2,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  PlusCircle,
  Link,
  Navigation,
  Info,
} from 'lucide-react'

const readableTraceText = (text: string) => text.replace(/\bnull\b/gi, 'no node')

export function InteractiveMemoryWorkbench({
  questionId,
  studentTrace,
}: {
  questionId?: string
  studentTrace?: Trace
}) {
  const replayQuestions = questions.filter((question) => question.supportsReplay)
  const [selectedQuestionId, setSelectedQuestionId] = useState(
    questionId && getReplaySetup(questionId) ? questionId : replayQuestions[0]?.id ?? ''
  )
  const activeQuestionId = selectedQuestionId
  const setup = getReplaySetup(activeQuestionId)
  const [operations, setOperations] = useState<Operation[]>([])
  const [reference, setReference] = useState<Trace | null>(null)
  const [learnerTrace, setLearnerTrace] = useState<Trace | null>(null)
  const [step, setStep] = useState(0)
  const [view, setView] = useState<'2d' | '3d'>('2d')
  const [playing, setPlaying] = useState(false)

  const trace = learnerTrace ?? reference

  useEffect(() => {
    if (questionId && getReplaySetup(questionId)) setSelectedQuestionId(questionId)
  }, [questionId])

  useEffect(() => {
    setOperations([])
    setStep(0)
    setLearnerTrace(studentTrace ?? null)
    if (setup) {
      void Promise.resolve(
        TracewiseApi.runReplay(correctInsertAtHead(setup.newNode), setup.initial)
      ).then(setReference)
    }
  }, [activeQuestionId, studentTrace])

  const run = async (op: Operation) => {
    if (!setup) return
    const next = [...operations, op]
    setOperations(next)
    setLearnerTrace(await TracewiseApi.runReplay(next, setup.initial))
    setStep(Math.max(0, next.length - 1))
  }

  const undo = async () => {
    if (!setup || !operations.length) return
    const next = operations.slice(0, -1)
    setOperations(next)
    setLearnerTrace(await TracewiseApi.runReplay(next, setup.initial))
    setStep(Math.max(0, next.length - 1))
  }

  useEffect(() => {
    if (!playing || !trace) return
    const timer = window.setInterval(() => {
      setStep((current) => {
        if (current >= trace.steps.length - 1) {
          setPlaying(false)
          return current
        }
        return current + 1
      })
    }, 1200)
    return () => window.clearInterval(timer)
  }, [playing, trace])

  if (!setup) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-16 text-center">
        <Card className="border-stone-200">
          <CardBody className="py-12 space-y-3">
            <Info className="w-10 h-10 text-stone-400 mx-auto" />
            <h2 className="text-lg font-bold text-stone-900">Choose a Replay Scenario</h2>
            <p className="text-xs text-stone-600">Select a question that supports algorithmic pointer replay to inspect memory states.</p>
          </CardBody>
        </Card>
      </main>
    )
  }

  const currentFrameIndex = Math.min(step, Math.max(0, (trace?.steps.length ?? 1) - 1))
  const frame = trace?.steps[currentFrameIndex]

  const frames: OperationStep[] = (trace?.steps ?? []).map((f) => {
    const ids = new Map(Object.keys(f.nodes).map((name) => [name, `node-${name}`]))
    const snapshot: MemorySnapshot = {
      nodes: Object.entries(f.nodes).map(([name, node]) => ({
        id: ids.get(name)!,
        val: name,
        nextId: node.next ? ids.get(node.next) ?? null : null,
        status: f.unreachable.includes(name)
          ? 'unreachable'
          : name === setup.newNode
          ? 'allocated'
          : 'linked',
        isHeadTarget: f.head === name,
      })),
      pointers: [
        { name: 'head', targetNodeId: f.head ? ids.get(f.head) ?? null : null, color: '#0d9488' },
        { name: 'newNode', targetNodeId: ids.get(setup.newNode) ?? null, color: '#2563eb' },
      ],
      headTargetId: f.head ? ids.get(f.head) ?? null : null,
      unreachableNodeIds: f.unreachable.map((name) => ids.get(name) ?? name),
      hasCycle: f.note.toLowerCase().includes('cycle'),
      invariantStatus: trace?.error ? 'flawed' : 'in-progress',
      invariantNote: trace?.error ?? f.note,
    }
    return {
      stepIndex: f.index,
      label: `Step ${f.index + 1}`,
      codeInstruction: readableTraceText(JSON.stringify(f.operation)),
      description: readableTraceText(f.note),
      targetPointersAffected: [f.operation.op],
      snapshot,
    }
  })

  const snapshot = frames[Math.min(step, Math.max(0, frames.length - 1))]?.snapshot

  return (
    <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 animate-in fade-in duration-200">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900">
              Interactive Memory Workbench
            </h1>
            <Badge variant="teal" size="sm" icon={<Cpu className="w-3.5 h-3.5 text-teal-700" />}>
              Heap Simulator
            </Badge>
          </div>
          <p className="text-sm text-stone-600 max-w-2xl">
            Deterministic step-by-step memory replay. Add pointer operations to visually inspect cycle creation, orphan nodes, and invariant preservation.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl border border-stone-200 self-start md:self-auto">
          <Button
            type="button"
            size="sm"
            variant={view === '2d' ? 'primary' : 'outline'}
            aria-pressed={view === '2d'}
            onClick={() => setView('2d')}
            leftIcon={<Layers className="w-3.5 h-3.5" />}
          >
            2D Canvas
          </Button>
          <Button
            type="button"
            size="sm"
            variant={view === '3d' ? 'primary' : 'outline'}
            aria-pressed={view === '3d'}
            onClick={() => setView('3d')}
            leftIcon={<Box className="w-3.5 h-3.5" />}
          >
            3D Spatial
          </Button>
        </div>
      </div>

      {/* 2. Scenario Config & Operation Bar */}
      <Card className="border-stone-200 bg-white shadow-xs">
        <CardBody className="p-4 sm:p-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-100 pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <label htmlFor="replay-question-select" className="text-xs font-semibold text-stone-700 shrink-0">
                Active Scenario:
              </label>
              <select
                id="replay-question-select"
                aria-label="Active Scenario"
                value={activeQuestionId}
                onChange={(e) => setSelectedQuestionId(e.target.value)}
                className="w-full sm:w-80 text-xs bg-stone-50 border border-stone-300 rounded-lg px-3 py-1.5 text-stone-800 font-medium focus:ring-2 focus:ring-stone-400 focus:outline-none"
              >
                {replayQuestions.map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.prompt.split('\n')[0]}
                  </option>
                ))}
              </select>
            </div>

            {/* Scenario Metadata */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-stone-600 font-mono">
              <span className="bg-stone-100 px-2 py-0.5 rounded">
                List: {setup.initial.list.join(' → ')}
              </span>
              <span className="bg-stone-100 px-2 py-0.5 rounded">
                Head: {setup.initial.head ?? 'null'}
              </span>
              <span className="bg-stone-100 px-2 py-0.5 rounded text-blue-800 font-bold">
                New: {setup.newNode}
              </span>
              <Badge variant={learnerTrace ? 'amber' : 'teal'} size="sm">
                {learnerTrace ? 'Student Trace Active' : 'Canonical Reference'}
              </Badge>
            </div>
          </div>

          {/* Operation Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => void run({ op: 'allocate', node: setup.newNode, source_text: 'allocate new node' })}
              leftIcon={<PlusCircle className="w-3.5 h-3.5 text-blue-700" />}
            >
              Allocate Node {setup.newNode}
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() =>
                void run({
                  op: 'set_next',
                  node: setup.newNode,
                  target: setup.initial.head ?? 'null',
                  source_text: 'link new node to old head',
                })
              }
              leftIcon={<Link className="w-3.5 h-3.5 text-teal-700" />}
            >
              Link {setup.newNode}.next &rarr; Head
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => void run({ op: 'set_head', target: setup.newNode, source_text: 'move head to new node' })}
              leftIcon={<Navigation className="w-3.5 h-3.5 text-purple-700" />}
            >
              Move Head &rarr; {setup.newNode}
            </Button>

            <div className="h-6 w-px bg-stone-200 hidden sm:block mx-1"></div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void undo()}
              disabled={!operations.length}
              leftIcon={<Undo2 className="w-3.5 h-3.5" />}
            >
              Undo
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setPlaying(false)
                setOperations([])
                setLearnerTrace(null)
                setStep(0)
              }}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Reset
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Flaw / Cycle Alert */}
      {trace?.error && (
        <div role="alert" className="p-4 rounded-xl border border-rose-300 bg-rose-50 text-xs text-rose-800 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-rose-700 shrink-0" />
          <span className="font-semibold">{trace.error}</span>
        </div>
      )}

      {/* 3. Visualizer Viewport */}
      {snapshot && (
        <section className="space-y-4">
          {view === '2d' ? (
            <LinkedListVisualizer2D snapshot={snapshot} activeStepLabel={`Frame ${step + 1}`} />
          ) : (
            <MemoryVisualizer3DPlaceholder snapshot={snapshot} activeStepLabel={`Frame ${step + 1}`} />
          )}

          {/* Frame Inspector & Playback Controls */}
          <Card className="border-stone-200 bg-white shadow-xs">
            <CardHeader className="bg-stone-50/70 border-b border-stone-200 pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-stone-900 text-sm">Frame State Inspector</span>
                  <span className="rounded-full bg-stone-900 px-2 py-0.5 text-xs text-white font-mono">
                    Step {step + 1} of {trace?.steps.length ?? 0}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setStep((s) => Math.max(0, s - 1))}
                    disabled={step === 0}
                    aria-label="Previous step"
                  >
                    <SkipBack className="w-3.5 h-3.5" />
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => setPlaying((p) => !p)}
                    aria-label={playing ? 'Pause' : 'Play'}
                  >
                    {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setStep((s) => Math.min((trace?.steps.length ?? 1) - 1, s + 1))}
                    disabled={step >= (trace?.steps.length ?? 1) - 1}
                    aria-label="Next step"
                  >
                    <SkipForward className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardBody className="p-4 sm:p-5 space-y-4">
              {/* Range Slider Scrubber */}
              <div className="space-y-1">
                <input
                  className="w-full accent-stone-900 cursor-pointer h-2 bg-stone-200 rounded-lg"
                  aria-label="Trace frame scrubber"
                  type="range"
                  min={0}
                  max={Math.max(0, (trace?.steps.length ?? 1) - 1)}
                  value={step}
                  onChange={(e) => setStep(Number(e.target.value))}
                />
              </div>

              {/* Memory Diagnostics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-lg border border-stone-200 bg-stone-50/50">
                  <span className="text-stone-500 font-mono block text-[10px]">HEAD POINTER</span>
                  <span className="font-bold text-teal-800 text-sm mt-0.5 block">
                    {frame?.head ?? 'no node'}
                  </span>
                </div>

                <div className="p-3 rounded-lg border border-stone-200 bg-stone-50/50">
                  <span className="text-stone-500 font-mono block text-[10px]">REACHABLE CHAIN</span>
                  <span className="font-bold text-stone-900 text-sm mt-0.5 block truncate">
                    {frame?.reachable.join(' → ') || 'none'}
                  </span>
                </div>

                <div className="p-3 rounded-lg border border-stone-200 bg-stone-50/50">
                  <span className="text-stone-500 font-mono block text-[10px]">ORPHAN NODES</span>
                  <span className={`font-bold text-sm mt-0.5 block ${frame?.unreachable.length ? 'text-rose-700' : 'text-stone-700'}`}>
                    {frame?.unreachable.join(', ') || 'none'}
                  </span>
                </div>

                <div className="p-3 rounded-lg border border-stone-200 bg-stone-50/50">
                  <span className="text-stone-500 font-mono block text-[10px]">INVARIANT NOTE</span>
                  <span className="text-stone-700 text-xs mt-0.5 block line-clamp-2">
                    {readableTraceText(frame?.note ?? '')}
                  </span>
                </div>
              </div>

              {/* Operation Stepper Tree */}
              <OperationTreeStepper
                steps={frames}
                currentStepIndex={Math.min(step, Math.max(0, frames.length - 1))}
                onSelectStep={setStep}
              />
            </CardBody>
          </Card>
        </section>
      )}

      {/* 4. Reference Trace Diff Comparison Drawer */}
      {reference && (
        <details className="group rounded-xl border border-stone-200 bg-white p-4 text-xs transition-all">
          <summary className="font-semibold text-stone-900 cursor-pointer flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-700" />
              <span>Canonical Reference Solution Comparison</span>
            </span>
            <span className="text-stone-400 group-open:rotate-180 transition-transform">&darr;</span>
          </summary>
          <div className="pt-3 mt-2 border-t border-stone-100 space-y-2 text-stone-700 font-mono">
            <p>Reference final list: <strong className="text-stone-900">{reference.final_list.join(' → ')}</strong></p>
            <p>Your trace final list: <strong className="text-stone-900">{trace?.final_list.join(' → ') ?? 'unavailable'}</strong></p>
            <div className="space-y-1 pt-2">
              {reference.steps.map((f) => (
                <div key={f.index} className="p-2 rounded bg-stone-50 border border-stone-200 flex flex-wrap justify-between gap-2">
                  <span>Step {f.index + 1}: head &rarr; {f.head ?? 'null'}</span>
                  <span>reachable: {f.reachable.join(' → ') || 'none'}</span>
                  <span>orphans: {f.unreachable.join(', ') || 'none'}</span>
                </div>
              ))}
            </div>
          </div>
        </details>
      )}
    </main>
  )
}
