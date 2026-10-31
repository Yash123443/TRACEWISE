import React from 'react';
import type { ConceptNode, ConceptEdge } from '../../types/conceptGraph';
import { StatusIndicator } from './StatusIndicator';
import { Box, Compass } from 'lucide-react';

export interface ConceptGraph3DProps {
  nodes: ConceptNode[];
  edges: ConceptEdge[];
  selectedNodeId: string;
  onSelectNode: (nodeId: string) => void;
}

/**
 * 3D Component Boundary for Tracewise Concept Prerequisite Graph.
 * Renders a restrained, isometric 3D spatial layout using clean CSS 3D transforms
 * without importing Three.js / WebGL runtime dependencies.
 */
export const ConceptGraph3DPlaceholder: React.FC<ConceptGraph3DProps> = ({
  nodes,
  edges,
  selectedNodeId,
  onSelectNode,
}) => {
  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || nodes[0];

  return (
    <div className="bg-white rounded-xl border border-stone-300 text-stone-900 p-5 sm:p-6 shadow-xs relative overflow-hidden min-h-[460px] flex flex-col justify-between">
      {/* 3D Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-200 relative z-10">
        <div className="flex items-center gap-2">
          <Box className="w-4 h-4 text-stone-700" />
          <h3 className="text-xs sm:text-sm font-semibold tracking-tight text-stone-900">
            Spatial 3D Concept Topology (Isometric Perspective)
          </h3>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-mono text-[10px] text-stone-700 bg-stone-100 px-2 py-0.5 rounded border border-stone-200 font-medium">
            Selected: {selectedNode.title}
          </span>
          <span className="font-mono text-[10px] text-stone-500 bg-stone-50 px-2 py-0.5 rounded border border-stone-200">
            30° Depth Tilt
          </span>
        </div>
      </div>

      {/* 3D Isometric Prerequisite Planes */}
      <div className="my-8 py-6 flex items-center justify-center overflow-x-auto perspective-[1200px]">
        <div
          className="flex flex-col gap-6 px-6 py-4 min-w-max transition-all duration-500"
          style={{
            transform: 'rotateX(26deg) rotateY(-14deg) rotateZ(2deg)',
            transformStyle: 'preserve-3d',
          }}
        >
          {[1, 2, 3, 4, 5].map((tier) => {
            const tierNodes = nodes.filter((n) => n.tier === tier);
            const elevation = (5 - tier) * 22; // Higher tiers appear elevated in 3D

            return (
              <div
                key={tier}
                className="flex items-center gap-4 transition-transform duration-300"
                style={{
                  transform: `translateZ(${elevation}px)`,
                }}
              >
                <div className="w-16 text-right font-mono text-[10px] text-stone-500 shrink-0">
                  Tier {tier}
                </div>

                <div className="flex items-center gap-3">
                  {tierNodes.map((node) => {
                    const isSelected = selectedNodeId === node.id;
                    const isPrereq = selectedNode.prerequisites.includes(node.id);
                    const isDep = selectedNode.dependents.includes(node.id);

                    return (
                      <div
                        key={node.id}
                        onClick={() => onSelectNode(node.id)}
                        className={`w-44 p-3 rounded-lg border text-left cursor-pointer transition-all duration-300 select-none shadow-xs ${
                          isSelected
                            ? 'bg-stone-50 border-stone-900 shadow-sm ring-2 ring-stone-900 scale-105'
                            : isPrereq
                            ? 'bg-amber-50/70 border-amber-300'
                            : isDep
                            ? 'bg-blue-50/70 border-blue-300'
                            : 'bg-white border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                        }`}
                        style={{
                          transform: isSelected ? 'translateZ(18px)' : 'translateZ(0px)',
                        }}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <span className="font-semibold text-xs text-stone-900 truncate">
                            {node.title}
                          </span>
                          <StatusIndicator status={node.demoLearnerState.status} size="sm" showLabel={false} />
                        </div>

                        <div className="text-[10px] font-mono text-stone-500 truncate">
                          {node.cSyntaxSignature.split('\n')[0]}
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

      {/* 3D Component Boundary Notice */}
      <div className="pt-3 border-t border-stone-200 flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-stone-600" />
          <span>
            3D Graph Engine Boundary: Exposes pure data props (<code className="text-stone-800 font-mono">ConceptGraph3DProps</code>) ready for WebGL/Three.js.
          </span>
        </div>
        <span className="text-[11px] font-mono text-stone-400">
          Edges: {edges.length} labeled relationships
        </span>
      </div>
    </div>
  );
};
