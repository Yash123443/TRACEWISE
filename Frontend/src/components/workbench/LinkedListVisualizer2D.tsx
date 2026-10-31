import React from 'react';
import type { MemorySnapshot, MemoryNode } from '../../types/workbenchTrace';
import { Badge } from '../common/Badge';
import {
  ArrowRight,
  AlertTriangle,
  RotateCcw,
  Unlink,
  CheckCircle2,
} from 'lucide-react';

interface LinkedListVisualizer2DProps {
  snapshot: MemorySnapshot;
  activeStepLabel: string;
}

export const LinkedListVisualizer2D: React.FC<LinkedListVisualizer2DProps> = ({
  snapshot,
  activeStepLabel,
}) => {
  const { nodes, pointers, headTargetId, unreachableNodeIds, hasCycle, cycleNodeId, invariantNote } =
    snapshot;

  const headPointer = pointers.find((p) => p.name === 'head');
  const newNodePointer = pointers.find((p) => p.name === 'newNode');

  const getNodeById = (id: string | null): MemoryNode | undefined => {
    if (!id) return undefined;
    return nodes.find((n) => n.id === id);
  };

  return (
    <div className="bg-white rounded-xl border border-stone-300 text-stone-900 p-5 sm:p-6 shadow-xs flex flex-col justify-between min-h-[380px]">
      {/* Visualizer Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-stone-200">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-stone-800" />
          <h3 className="text-xs sm:text-sm font-semibold tracking-tight text-stone-900">
            Heap Memory Layout & Pointer Structure (2D Visualizer)
          </h3>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Badge variant="teal" size="sm">
            {activeStepLabel}
          </Badge>
          {unreachableNodeIds.length > 0 && (
            <Badge variant="red" size="sm" icon={<Unlink className="w-3 h-3 text-rose-700" />}>
              {unreachableNodeIds.length} Orphaned
            </Badge>
          )}
          {hasCycle && (
            <Badge variant="amber" size="sm" icon={<RotateCcw className="w-3 h-3 text-amber-700" />}>
              Cycle Detected
            </Badge>
          )}
        </div>
      </div>

      {/* Main Node Memory Blocks Row */}
      <div className="py-4 overflow-x-auto" aria-label="Scrollable memory diagram">
        <p className="px-2 text-xs text-stone-500">Scroll horizontally to view every node.</p>
        <div className="flex items-center gap-4 sm:gap-6 min-w-max px-2 py-4">
          {/* Head Pointer Pill at start */}
          <div className="flex flex-col items-center">
            <div className="px-3 py-1.5 rounded-md bg-stone-900 text-white text-xs font-mono font-bold shadow-xs flex items-center gap-1.5">
              <span>HEAD</span>
              <span className="text-[10px] text-stone-300 font-normal">
                ({headPointer?.targetNodeId ? getNodeById(headPointer.targetNodeId)?.val : 'NULL'})
              </span>
            </div>
            <div className="h-6 w-0.5 bg-stone-800 my-1" />
            <ArrowRight className="w-4 h-4 text-stone-800 rotate-90" />
          </div>

          {/* Render Nodes */}
          {nodes.map((node) => {
            const isHeadTarget = headTargetId === node.id;
            const isNewNode = node.val === 'N';
            const isUnreachable = unreachableNodeIds.includes(node.id);
            const isCycleSource = hasCycle && cycleNodeId === node.id;
            const nextNode = getNodeById(node.nextId);

            return (
              <div key={node.id} className="flex items-center gap-3 sm:gap-4">
                {/* Node Card */}
                <div
                  className={`w-36 rounded-lg border p-3.5 transition-all duration-200 relative select-none ${
                    isUnreachable
                      ? 'bg-rose-50/80 border-rose-300 text-rose-950 shadow-xs ring-1 ring-rose-400'
                      : isNewNode
                      ? 'bg-teal-50/40 border-teal-400 text-stone-900 shadow-xs ring-1 ring-teal-300'
                      : isHeadTarget
                      ? 'bg-stone-50 border-stone-800 shadow-2xs ring-1 ring-stone-700'
                      : 'bg-stone-50/60 border-stone-300 text-stone-900'
                  }`}
                >
                  {/* Floating pointer tag if newNode pointer references this */}
                  {newNodePointer?.targetNodeId === node.id && (
                    <div className="absolute -top-3 left-3 px-2 py-0.5 rounded bg-blue-700 text-white font-mono text-[10px] font-semibold shadow-2xs">
                      newNode*
                    </div>
                  )}

                  {/* Node Address & Status Header */}
                  <div className="flex items-center justify-between text-[10px] font-mono text-stone-500 mb-2 border-b border-stone-200 pb-1">
                    {node.memoryAddress && <span>{node.memoryAddress}</span>}
                    {isUnreachable ? (
                      <span className="text-rose-700 font-semibold flex items-center gap-0.5">
                        <AlertTriangle className="w-2.5 h-2.5" />
                        ORPHAN
                      </span>
                    ) : isHeadTarget ? (
                      <span className="text-stone-900 font-semibold">HEAD</span>
                    ) : (
                      <span className="text-stone-400">NODE</span>
                    )}
                  </div>

                  {/* Value & Next Split Box */}
                  <div className="grid grid-cols-2 gap-1.5 bg-white p-2 rounded-md border border-stone-300 text-center font-mono">
                    <div className="flex flex-col border-r border-stone-200 pr-1">
                      <span className="text-[9px] text-stone-400 uppercase tracking-widest">val</span>
                      <span
                        className={`text-base font-bold ${
                          isNewNode
                            ? 'text-teal-800'
                            : isUnreachable
                            ? 'text-rose-700'
                            : 'text-stone-900'
                        }`}
                      >
                        '{node.val}'
                      </span>
                    </div>

                    <div className="flex flex-col pl-1">
                      <span className="text-[9px] text-stone-400 uppercase tracking-widest">next</span>
                      <span className="text-xs font-semibold text-stone-700 truncate" title={node.nextId || 'NULL'}>
                        {nextNode ? nextNode.val : 'NULL'}
                      </span>
                    </div>
                  </div>

                  {/* Self loop alert */}
                  {isCycleSource && (
                    <div className="mt-2 text-[10px] text-rose-800 bg-rose-100/70 px-1.5 py-0.5 rounded border border-rose-300 text-center font-medium">
                      Loops to Self (Cycle)
                    </div>
                  )}
                </div>

                {/* Arrow Connector to next node */}
                <div className="flex flex-col items-center px-1">
                  {node.nextId ? (
                    <div className="flex items-center text-stone-800">
                      <div className="w-6 sm:w-8 h-0.5 bg-stone-800" />
                      <ArrowRight className="w-4 h-4 -ml-1 text-stone-800" />
                    </div>
                  ) : (
                    <div className="flex items-center text-stone-400">
                      <div className="w-4 sm:w-6 h-0.5 bg-stone-300" />
                      <span className="px-1.5 py-0.5 bg-stone-100 text-[10px] font-mono rounded text-stone-600 border border-stone-300 ml-1">
                        NULL
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Visualizer Bottom Explanation & Invariant Status Bar */}
      <div className="mt-4 pt-3 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          {unreachableNodeIds.length > 0 ? (
            <div className="flex items-center gap-1.5 text-rose-800 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-700" />
              <span>
                <strong>Unreachable Memory Leak:</strong> Nodes [
                {unreachableNodeIds.map((id) => getNodeById(id)?.val).join(', ')}
                ] cannot be traversed from head!
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-teal-900 bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-200">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-teal-700" />
              <span>{invariantNote}</span>
            </div>
          )}
        </div>

        <div className="text-[11px] font-mono text-stone-500 font-medium">
          Reachable Nodes: {nodes.filter((n) => !unreachableNodeIds.includes(n.id)).length} / {nodes.length}
        </div>
      </div>
    </div>
  );
};
