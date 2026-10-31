import React, { useState, useEffect, useRef, useCallback } from 'react';
import type {
  LinkedListInsertionFixtureTrace,
  MemorySnapshot,
  ConstraintCorrectionScenario,
} from '../../types/workbenchTrace';
import type { Operation } from '../../../../TRACEWISE/src/engine/contracts/index.js';
import { TracewiseApi } from '../../services/apiService';
import { LINKED_LIST_INSERTION_FIXTURE } from '../../mock/linkedListTraceFixture';
import { LinkedListVisualizer2D } from './LinkedListVisualizer2D';
import { MemoryVisualizer3DPlaceholder } from './MemoryVisualizer3DPlaceholder';
import { OperationTreeStepper } from './OperationTreeStepper';
import { PredictionStepCard } from './PredictionStepCard';
import { ConstraintCorrectionLab } from './ConstraintCorrectionLab';
import { PlaybackControls } from './PlaybackControls';
import { TransferQuestionCard } from './TransferQuestionCard';
import { Card, CardHeader, CardBody } from '../common/Card';
import { Badge } from '../common/Badge';
import {
  Layers,
  Box,
  BookOpen,
  ShieldCheck,
} from 'lucide-react';

interface InteractiveMemoryWorkbenchProps {
  fixtureTrace?: LinkedListInsertionFixtureTrace;
}

export const InteractiveMemoryWorkbench: React.FC<InteractiveMemoryWorkbenchProps> = ({
  fixtureTrace = LINKED_LIST_INSERTION_FIXTURE,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isConstraintMode, setIsConstraintMode] = useState(false);
  const [customSnapshot, setCustomSnapshot] = useState<MemorySnapshot | null>(null);
  const [activeScenarioId, setActiveScenarioId] = useState<string>(
    fixtureTrace.constraintCorrectionScenarios[0].id
  );
  const [historyStack, setHistoryStack] = useState<number[]>([0]);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentStep = fixtureTrace.steps[currentStepIndex];
  const activeSnapshot = isConstraintMode && customSnapshot ? customSnapshot : currentStep.snapshot;

  // Step Navigation handlers
  const handleStepForward = useCallback(() => {
    if (currentStepIndex < fixtureTrace.steps.length - 1) {
      setIsConstraintMode(false);
      setCustomSnapshot(null);
      setCurrentStepIndex((prev) => {
        const next = prev + 1;
        setHistoryStack((h) => [...h, next]);
        return next;
      });
    } else {
      setIsPlaying(false);
    }
  }, [currentStepIndex, fixtureTrace.steps.length]);

  const handleStepBack = useCallback(() => {
    if (currentStepIndex > 0) {
      setIsConstraintMode(false);
      setCustomSnapshot(null);
      setCurrentStepIndex((prev) => {
        const next = prev - 1;
        setHistoryStack((h) => [...h, next]);
        return next;
      });
    }
  }, [currentStepIndex]);

  const handleReset = useCallback(() => {
    setIsPlaying(false);
    setIsConstraintMode(false);
    setCustomSnapshot(null);
    setCurrentStepIndex(0);
    setHistoryStack([0]);
  }, []);

  const handleUndo = useCallback(() => {
    if (isConstraintMode) {
      setIsConstraintMode(false);
      setCustomSnapshot(null);
      return;
    }
    if (historyStack.length > 1) {
      const nextHistory = [...historyStack];
      nextHistory.pop();
      const prevStep = nextHistory[nextHistory.length - 1];
      setHistoryStack(nextHistory);
      setCurrentStepIndex(prevStep);
    }
  }, [isConstraintMode, historyStack]);

  const handleTogglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  // Auto-play interval
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev < fixtureTrace.steps.length - 1) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, 2600);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, fixtureTrace.steps.length]);

  // Keyboard navigation listener (←, →, Space, R)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === 'textarea' || activeTag === 'input' || activeTag === 'select') {
        return;
      }

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleStepForward();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleStepBack();
      } else if (e.key === ' ') {
        e.preventDefault();
        handleTogglePlay();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleReset();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleStepForward, handleStepBack, handleTogglePlay, handleReset]);

  // Constraint correction scenario selection
  const applyEngineSnapshot = async (snapshot: MemorySnapshot) => {
    const existingIds = new Map(snapshot.nodes.map((node) => [node.val, node.id]));
    const baseNodes = new Set(['A', 'B', 'C']);
    const operations: Operation[] = [];
    for (const node of snapshot.nodes) {
      if (!baseNodes.has(node.val)) operations.push({ op: 'allocate', node: node.val, source_text: `allocate ${node.val}` });
    }
    for (const node of snapshot.nodes) {
      const original = node.val === 'A' ? 'B' : node.val === 'B' ? 'C' : null;
      const next = snapshot.nodes.find((candidate) => candidate.id === node.nextId)?.val ?? null;
      if (original !== next) operations.push({ op: 'set_next', node: node.val, target: next ?? 'null', source_text: `${node.val}.next = ${next ?? 'null'}` });
    }
    const head = snapshot.nodes.find((node) => node.id === snapshot.headTargetId)?.val ?? null;
    operations.push({ op: 'set_head', target: head ?? 'null', source_text: `head = ${head ?? 'null'}` });
    const replay = await TracewiseApi.runReplay(operations);
    const frame = replay.steps.at(-1);
    const nodes = Object.entries(frame?.nodes ?? {}).map(([name, node]) => ({
      id: existingIds.get(name) ?? `node-${name.toLowerCase()}`,
      val: name,
      memoryAddress: snapshot.nodes.find((item) => item.val === name)?.memoryAddress ?? 'engine-managed',
      nextId: node.next ? existingIds.get(node.next) ?? `node-${node.next.toLowerCase()}` : null,
      status: replay.unreachable_nodes.includes(name) ? 'unreachable' as const : baseNodes.has(name) ? 'linked' as const : 'allocated' as const,
      isHeadTarget: replay.final_head === name,
    }));
    const nodeIds = new Map(nodes.map((node) => [node.val, node.id]));
    const hasCycle = replay.steps.at(-1)?.note.includes('cycle') ?? false;
    const result: MemorySnapshot = {
      nodes,
      pointers: [
        { name: 'head', targetNodeId: replay.final_head ? nodeIds.get(replay.final_head) ?? null : null, color: '#0d9488' },
        ...snapshot.pointers.filter((pointer) => pointer.name !== 'head').map((pointer) => ({
          ...pointer,
          targetNodeId: snapshot.nodes.find((node) => node.id === pointer.targetNodeId)?.val
            ? nodeIds.get(snapshot.nodes.find((node) => node.id === pointer.targetNodeId)!.val) ?? null
            : null,
        })),
      ],
      headTargetId: replay.final_head ? nodeIds.get(replay.final_head) ?? null : null,
      unreachableNodeIds: replay.unreachable_nodes.map((name) => nodeIds.get(name) ?? name),
      hasCycle,
      invariantStatus: replay.error || replay.unreachable_nodes.length || hasCycle ? 'flawed' : 'valid',
      invariantNote: replay.error ?? frame?.note ?? 'Engine replay completed.',
    };
    setIsConstraintMode(true);
    setCustomSnapshot(result);
  };

  const handleSelectScenario = async (scenario: ConstraintCorrectionScenario) => {
    setActiveScenarioId(scenario.id);
    setIsConstraintMode(true);
    await applyEngineSnapshot(scenario.resultingSnapshot);
  };

  const handleCustomConnectionChange = async (snapshot: MemorySnapshot) => {
    await applyEngineSnapshot(snapshot);
  };

  const handleResetToBaseline = () => {
    setIsConstraintMode(false);
    setCustomSnapshot(null);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-in fade-in duration-150">
      {/* Workbench Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900">
              Interactive Memory Trace Workbench
            </h1>
            <Badge variant="teal" size="sm">
              Linked List Insertion
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-stone-500">
            Step through memory allocations, predict invariant transitions, and test pointer constraint reorderings.
          </p>
        </div>

        {/* View Mode Switcher: 2D Accessible vs 3D Spatial Canvas */}
        <div className="flex items-center gap-1.5 bg-white border border-stone-300 p-1 rounded-lg shadow-2xs text-xs">
          <button
            type="button"
            onClick={() => setViewMode('2d')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === '2d'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>2D Accessible Canvas</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('3d')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === '3d'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>3D Spatial View</span>
          </button>
        </div>
      </div>

      {/* Contract & Fixture Notice */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2 rounded-lg bg-stone-100 border border-stone-200 text-xs text-stone-700">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-stone-600 shrink-0" />
          <span>
            <strong className="text-stone-900">Trace Engine Fixture:</strong> {fixtureTrace.fixtureLabel}. Isolated simulator contract ready for engine plug-in.
          </span>
        </div>
        <span className="font-mono text-[11px] text-stone-500">
          Target: {fixtureTrace.problemStatement.targetListRepresentation}
        </span>
      </div>

      {/* Top Section: Problem Description & Memory Visualizer */}
      <div className="space-y-4">
        {/* Memory Visualizer Canvas (2D or 3D) */}
        {viewMode === '2d' ? (
          <LinkedListVisualizer2D
            snapshot={activeSnapshot}
            activeStepLabel={isConstraintMode ? 'Constraint Lab State' : currentStep.label}
          />
        ) : (
          <MemoryVisualizer3DPlaceholder
            snapshot={activeSnapshot}
            activeStepLabel={isConstraintMode ? 'Constraint Lab State' : currentStep.label}
          />
        )}

        {/* Stepping Playback Toolbar */}
        <PlaybackControls
          currentStep={currentStepIndex}
          totalSteps={fixtureTrace.steps.length}
          isPlaying={isPlaying}
          canUndo={historyStack.length > 1 || isConstraintMode}
          onStepBack={handleStepBack}
          onStepForward={handleStepForward}
          onTogglePlay={handleTogglePlay}
          onReset={handleReset}
          onUndo={handleUndo}
        />
      </div>

      {/* Middle Two-Column Grid: Operation Tree & Prediction / Constraint Lab */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Operation Tree Stepper (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <OperationTreeStepper
            steps={fixtureTrace.steps}
            currentStepIndex={currentStepIndex}
            onSelectStep={(idx) => {
              setIsConstraintMode(false);
              setCustomSnapshot(null);
              setCurrentStepIndex(idx);
              setHistoryStack((h) => [...h, idx]);
            }}
          />

          {/* Problem Statement Card */}
          <Card className="border-stone-200">
            <CardHeader className="bg-stone-50/70 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-stone-700" />
                <h4 className="font-semibold text-stone-900 text-sm">
                  Goal: {fixtureTrace.problemStatement.title}
                </h4>
              </div>
            </CardHeader>
            <CardBody className="p-4 space-y-2 text-xs text-stone-600">
              <p className="leading-relaxed">
                {fixtureTrace.problemStatement.description}
              </p>
              <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200 font-mono text-[11px] text-stone-800">
                <div>Initial: {fixtureTrace.problemStatement.initialListRepresentation}</div>
                <div>Target: &nbsp;{fixtureTrace.problemStatement.targetListRepresentation}</div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right Column: Prediction Step (when available) & Constraint Correction Lab (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Step Prediction Check */}
          {currentStep.prediction && (
            <PredictionStepCard prediction={currentStep.prediction} />
          )}

          {/* Interactive Constraint Correction Lab */}
          <ConstraintCorrectionLab
            scenarios={fixtureTrace.constraintCorrectionScenarios}
            activeScenarioId={activeScenarioId}
            onSelectScenario={handleSelectScenario}
            onCustomConnectionChange={handleCustomConnectionChange}
            onResetToBaseline={handleResetToBaseline}
          />
        </div>
      </div>

      {/* Bottom Section: Transfer Question Placeholder */}
      <section aria-label="Transfer Invariant Reasoning">
        <TransferQuestionCard contract={fixtureTrace.transferQuestion} />
      </section>
    </main>
  );
};
