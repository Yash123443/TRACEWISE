import React, { useState } from 'react';
import type {
  ConstraintCorrectionScenario,
  MemorySnapshot,
  MemoryNode,
} from '../../types/workbenchTrace';
import { Card, CardHeader, CardBody } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import {
  Wrench,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';

interface ConstraintCorrectionLabProps {
  scenarios: ConstraintCorrectionScenario[];
  activeScenarioId: string;
  onSelectScenario: (scenario: ConstraintCorrectionScenario) => void;
  onCustomConnectionChange: (snapshot: MemorySnapshot) => void;
  onResetToBaseline: () => void;
}

export const ConstraintCorrectionLab: React.FC<ConstraintCorrectionLabProps> = ({
  scenarios,
  activeScenarioId,
  onSelectScenario,
  onCustomConnectionChange,
  onResetToBaseline,
}) => {
  const [mode, setMode] = useState<'presets' | 'custom'>('presets');
  const [customHeadTarget, setCustomHeadTarget] = useState<string>('node-new');
  const [customNewNodeNext, setCustomNewNodeNext] = useState<string>('node-a');

  // Compute live traversal from custom pointer wiring
  const evaluateCustomConnections = (headTarget: string, newNext: string) => {
    const baseNodes: MemoryNode[] = [
      { id: 'node-new', val: 'N', memoryAddress: '0x1040', nextId: newNext === 'null' ? null : newNext, status: 'active', isHeadTarget: headTarget === 'node-new' },
      { id: 'node-a', val: 'A', memoryAddress: '0x2000', nextId: 'node-b', status: 'linked', isHeadTarget: headTarget === 'node-a' },
      { id: 'node-b', val: 'B', memoryAddress: '0x2040', nextId: 'node-c', status: 'linked', isHeadTarget: headTarget === 'node-b' },
      { id: 'node-c', val: 'C', memoryAddress: '0x2080', nextId: null, status: 'linked', isHeadTarget: headTarget === 'node-c' },
    ];

    // Traverse from headTarget
    const reachable = new Set<string>();
    let curr: string | null = headTarget === 'null' ? null : headTarget;
    let hasCycle = false;
    let cycleNode: string | undefined;

    while (curr) {
      if (reachable.has(curr)) {
        hasCycle = true;
        cycleNode = curr;
        break;
      }
      reachable.add(curr);
      const node = baseNodes.find((n) => n.id === curr);
      curr = node?.nextId || null;
    }

    const unreachable = baseNodes.filter((n) => !reachable.has(n.id)).map((n) => n.id);

    // Update node statuses
    baseNodes.forEach((n) => {
      if (unreachable.includes(n.id)) {
        n.status = 'unreachable';
      }
    });

    const isFlawed = unreachable.length > 0 || hasCycle;

    const snapshot: MemorySnapshot = {
      nodes: baseNodes,
      pointers: [
        { name: 'head', targetNodeId: headTarget === 'null' ? null : headTarget, color: '#0d9488' },
        { name: 'newNode', targetNodeId: 'node-new', color: '#2563eb' },
      ],
      headTargetId: headTarget === 'null' ? null : headTarget,
      unreachableNodeIds: unreachable,
      hasCycle,
      cycleNodeId: cycleNode,
      invariantStatus: isFlawed ? 'flawed' : 'valid',
      invariantNote: isFlawed
        ? `Constraint flaw: ${unreachable.length} node(s) orphaned in heap memory.`
        : 'All 4 nodes successfully connected and reachable in sequence.',
    };

    onCustomConnectionChange(snapshot);
  };

  const handleHeadChange = (val: string) => {
    setCustomHeadTarget(val);
    evaluateCustomConnections(val, customNewNodeNext);
  };

  const handleNewNextChange = (val: string) => {
    setCustomNewNodeNext(val);
    evaluateCustomConnections(customHeadTarget, val);
  };

  return (
    <Card className="border-stone-200 bg-white shadow-xs">
      <CardHeader
        className="bg-stone-50/70 border-b border-stone-200"
        action={
          <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-md text-xs">
            <button
              type="button"
              onClick={() => setMode('presets')}
              className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                mode === 'presets' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Order Presets
            </button>
            <button
              type="button"
              onClick={() => setMode('custom')}
              className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                mode === 'custom' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Connection Editor
            </button>
          </div>
        }
      >
        <div className="flex items-center gap-2">
          <Wrench className="w-4 h-4 text-stone-700" />
          <h3 className="font-semibold text-stone-900 text-sm">
            Constraint Correction Lab
          </h3>
        </div>
      </CardHeader>

      <CardBody className="p-4 sm:p-5 space-y-4">
        {mode === 'presets' ? (
          <div className="space-y-3">
            <p className="text-xs text-stone-500">
              Select an operation ordering to inspect how premature reassignment affects memory reachability:
            </p>

            <div className="grid grid-cols-1 gap-2.5">
              {scenarios.map((scen) => {
                const isSelected = activeScenarioId === scen.id;
                const isFlawed = scen.resultingSnapshot.unreachableNodeIds.length > 0 || scen.resultingSnapshot.hasCycle;

                return (
                  <button
                    key={scen.id}
                    type="button"
                    onClick={() => onSelectScenario(scen)}
                    className={`w-full text-left p-3.5 rounded-lg border transition-all select-none cursor-pointer ${
                      isSelected
                        ? isFlawed
                          ? 'bg-amber-50/70 border-amber-300 ring-1 ring-amber-300'
                          : 'bg-teal-50/70 border-teal-300 ring-1 ring-teal-300'
                        : 'bg-white border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-semibold text-xs sm:text-sm text-stone-900">
                        {scen.name}
                      </span>
                      {isFlawed ? (
                        <Badge variant="amber" size="sm" icon={<AlertTriangle className="w-3 h-3 text-amber-700" />}>
                          {scen.resultingSnapshot.unreachableNodeIds.length} Orphaned
                        </Badge>
                      ) : (
                        <Badge variant="teal" size="sm" icon={<CheckCircle2 className="w-3 h-3 text-teal-700" />}>
                          Valid Chain
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-1 mb-2">
                      {scen.codeSnippet.map((line, i) => (
                        <code
                          key={i}
                          className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-stone-100 text-stone-800 border border-stone-200 block w-fit"
                        >
                          {line}
                        </code>
                      ))}
                    </div>

                    <p className="text-[11px] text-stone-600 leading-relaxed">
                      {scen.diagnosticObservation}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-stone-500">
              Manually rewire the pointer targets and immediately inspect resulting list reachability and orphans:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-stone-50 p-4 rounded-lg border border-stone-200 text-xs">
              <div>
                <label className="font-semibold text-stone-900 block mb-1">
                  HEAD Pointer Variable Points To:
                </label>
                <select
                  value={customHeadTarget}
                  onChange={(e) => handleHeadChange(e.target.value)}
                  className="w-full bg-white border border-stone-300 rounded-md p-2 font-mono text-xs focus:ring-2 focus:ring-stone-400 focus:outline-none"
                >
                  <option value="node-new">newNode (Node 'N') [Address: 0x1040]</option>
                  <option value="node-a">Node 'A' [Address: 0x2000]</option>
                  <option value="node-b">Node 'B' [Address: 0x2040]</option>
                  <option value="node-c">Node 'C' [Address: 0x2080]</option>
                  <option value="null">NULL (Dangling Empty Head)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-stone-900 block mb-1">
                  newNode.next Pointer Points To:
                </label>
                <select
                  value={customNewNodeNext}
                  onChange={(e) => handleNewNextChange(e.target.value)}
                  className="w-full bg-white border border-stone-300 rounded-md p-2 font-mono text-xs focus:ring-2 focus:ring-stone-400 focus:outline-none"
                >
                  <option value="node-a">Node 'A' [Address: 0x2000]</option>
                  <option value="node-b">Node 'B' [Address: 0x2040]</option>
                  <option value="node-c">Node 'C' [Address: 0x2080]</option>
                  <option value="node-new">newNode 'N' (Self-Loop Cycle)</option>
                  <option value="null">NULL (Terminated)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-stone-500 font-mono">
                Real-time traversal evaluation active
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={onResetToBaseline}
                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              >
                Reset to Safe Invariant
              </Button>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
};
