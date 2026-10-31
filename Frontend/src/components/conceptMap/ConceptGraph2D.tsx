import React, { useRef } from 'react';
import type { ConceptNode, ConceptEdge } from '../../types/conceptGraph';
import { StatusIndicator } from './StatusIndicator';
import {
  Link,
  ChevronRight,
} from 'lucide-react';

interface ConceptGraph2DProps {
  nodes: ConceptNode[];
  edges: ConceptEdge[];
  selectedNodeId: string;
  onSelectNode: (nodeId: string) => void;
  statusFilter: string;
}

export const ConceptGraph2D: React.FC<ConceptGraph2DProps> = ({
  nodes,
  edges,
  selectedNodeId,
  onSelectNode,
  statusFilter,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Group nodes by tier (1 to 5)
  const tiers = [
    { tier: 1, title: 'Tier 1: Memory Foundations', subtitle: 'Hardware addresses, raw buffers, and composite layout' },
    { tier: 2, title: 'Tier 2: Dynamic Heap & Nodes', subtitle: 'Runtime allocation lifecycle & pointer linking' },
    { tier: 3, title: 'Tier 3: Linear Abstract Types', subtitle: 'LIFO & FIFO behavioral disciplines' },
    { tier: 4, title: 'Tier 4: Non-Linear Hierarchies', subtitle: 'Branching tree pointers & arbitrary graph networks' },
    { tier: 5, title: 'Tier 5: Algorithmic Operations', subtitle: 'Divide-and-conquer, pivot partitions, & search spaces' },
  ];

  // Active incoming and outgoing edges for the selected node
  const activeIncomingEdges = edges.filter((e) => e.target === selectedNodeId);
  const activeOutgoingEdges = edges.filter((e) => e.source === selectedNodeId);

  const getNodeById = (id: string): ConceptNode | undefined => nodes.find((n) => n.id === id);

  // Keyboard navigation across nodes using arrow keys
  const handleKeyDown = (e: React.KeyboardEvent, currentNodeId: string) => {
    const currentIndex = nodes.findIndex((n) => n.id === currentNodeId);
    if (currentIndex === -1) return;

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = (currentIndex + 1) % nodes.length;
      onSelectNode(nodes[nextIndex].id);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = (currentIndex - 1 + nodes.length) % nodes.length;
      onSelectNode(nodes[prevIndex].id);
    }
  };

  return (
    <div
      ref={containerRef}
      className="bg-white rounded-xl border border-stone-200 p-5 sm:p-6 shadow-xs flex flex-col space-y-6"
    >
      {/* Active Relationship Inspector Banner */}
      <div className="p-4 rounded-lg bg-stone-50 text-stone-900 space-y-3 border border-stone-200">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-2">
          <div className="flex items-center gap-2">
            <Link className="w-4 h-4 text-stone-700" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-800">
              Active Invariant Relationships
            </h3>
          </div>
          <span className="text-[11px] font-mono text-stone-500">
            Selected: <strong className="text-stone-900">{getNodeById(selectedNodeId)?.title}</strong>
          </span>
        </div>

        {/* Incoming prerequisites and outgoing dependents */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          {/* Incoming */}
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase text-stone-500 font-semibold tracking-wider block">
              Prerequisite Dependencies ({activeIncomingEdges.length}):
            </span>
            {activeIncomingEdges.length === 0 ? (
              <span className="text-stone-400 italic text-[11px] block">
                Foundational node — no upstream dependencies required.
              </span>
            ) : (
              activeIncomingEdges.map((edge) => {
                const sourceNode = getNodeById(edge.source);
                return (
                  <div
                    key={edge.id}
                    onClick={() => onSelectNode(edge.source)}
                    className="p-2 rounded-md bg-white hover:bg-stone-100 border border-stone-200 cursor-pointer transition-colors flex items-center justify-between gap-2 shadow-2xs"
                  >
                    <span className="text-stone-900 font-semibold truncate">
                      {sourceNode?.title}
                    </span>
                    <span className="text-[10px] text-stone-500 text-right">
                      ↳ {edge.relationshipLabel}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {/* Outgoing */}
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase text-stone-500 font-semibold tracking-wider block">
              Dependent Target Nodes ({activeOutgoingEdges.length}):
            </span>
            {activeOutgoingEdges.length === 0 ? (
              <span className="text-stone-400 italic text-[11px] block">
                Terminal advanced algorithmic structure.
              </span>
            ) : (
              activeOutgoingEdges.map((edge) => {
                const targetNode = getNodeById(edge.target);
                return (
                  <div
                    key={edge.id}
                    onClick={() => onSelectNode(edge.target)}
                    className="p-2 rounded-md bg-white hover:bg-stone-100 border border-stone-200 cursor-pointer transition-colors flex items-center justify-between gap-2 shadow-2xs"
                  >
                    <span className="text-stone-900 font-semibold truncate">
                      {targetNode?.title}
                    </span>
                    <span className="text-[10px] text-stone-500 text-right">
                      → {edge.relationshipLabel}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Tiered Concept Hierarchy Canvas */}
      <div className="space-y-8" role="tree" aria-label="C DSA Concept Prerequisite Tree">
        {tiers.map((t) => {
          const tierNodes = nodes.filter((n) => n.tier === t.tier);
          const filteredTierNodes = tierNodes.filter((n) =>
            statusFilter === 'all' ? true : n.demoLearnerState.status === statusFilter
          );

          if (filteredTierNodes.length === 0) return null;

          return (
            <div key={t.tier} className="space-y-3 relative">
              {/* Tier Header with step connector line */}
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-md bg-stone-900 text-white font-mono text-xs flex items-center justify-center font-bold shadow-2xs">
                  {t.tier}
                </span>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-stone-900 tracking-tight">
                    {t.title}
                  </h4>
                  <p className="text-[11px] text-stone-500 font-sans">
                    {t.subtitle}
                  </p>
                </div>
              </div>

              {/* Node Cards in this Tier */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5 pl-2 sm:pl-9">
                {filteredTierNodes.map((node) => {
                  const isSelected = selectedNodeId === node.id;
                  const isPrerequisiteOfSelected = activeIncomingEdges.some((e) => e.source === node.id);
                  const isDependentOfSelected = activeOutgoingEdges.some((e) => e.target === node.id);

                  return (
                    <div
                      key={node.id}
                      role="treeitem"
                      tabIndex={0}
                      aria-selected={isSelected}
                      onClick={() => onSelectNode(node.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onSelectNode(node.id);
                        } else {
                          handleKeyDown(e, node.id);
                        }
                      }}
                      className={`p-4 rounded-lg border text-left cursor-pointer transition-all duration-150 flex flex-col justify-between gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 select-none group relative ${
                        isSelected
                          ? 'bg-stone-50 border-stone-800 shadow-2xs ring-1 ring-stone-800'
                          : isPrerequisiteOfSelected
                          ? 'bg-amber-50/40 border-amber-300 ring-1 ring-amber-200'
                          : isDependentOfSelected
                          ? 'bg-blue-50/40 border-blue-300 ring-1 ring-blue-200'
                          : 'bg-white border-stone-200 hover:border-stone-300 hover:bg-stone-50/40'
                      }`}
                    >
                      {/* Connection role tag */}
                      {isPrerequisiteOfSelected && (
                        <div className="absolute -top-2.5 right-3 px-2 py-0.2 rounded bg-amber-700 text-white font-mono text-[9px] font-semibold shadow-2xs">
                          PREREQUISITE
                        </div>
                      )}
                      {isDependentOfSelected && (
                        <div className="absolute -top-2.5 right-3 px-2 py-0.2 rounded bg-blue-700 text-white font-mono text-[9px] font-semibold shadow-2xs">
                          DEPENDENT
                        </div>
                      )}

                      {/* Title & Status */}
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h5 className="font-semibold text-xs sm:text-sm text-stone-900 group-hover:text-stone-700 transition-colors">
                            {node.title}
                          </h5>
                          <StatusIndicator status={node.demoLearnerState.status} size="sm" />
                        </div>

                        <p className="text-[11px] text-stone-500 leading-snug line-clamp-2">
                          {node.summary}
                        </p>
                      </div>

                      {/* C Syntax Code Chip */}
                      <code className="text-[10px] font-mono bg-stone-50 text-stone-800 border border-stone-200 p-1.5 rounded block truncate">
                        {node.cSyntaxSignature.split('\n')[0]}
                      </code>

                      {/* Footer Info: Demo retention benchmark & Edge count */}
                      <div className="flex items-center justify-between text-[10px] font-mono text-stone-400 pt-2 border-t border-stone-100">
                        <span>
                          Retention: <strong className="text-stone-700">{node.demoLearnerState.retentionEstimatePercent}%</strong>
                        </span>
                        <span className="text-stone-500 font-sans flex items-center gap-1">
                          {node.prerequisites.length} in • {node.dependents.length} out
                          <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
