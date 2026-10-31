import React, { useState } from 'react';
import { Layers, Eye } from 'lucide-react';

interface ConstellationNode {
  id: string;
  name: string;
  category: string;
  x: number;
  y: number;
  zLayer: number; // for 3D depth illusion
  invariantRule: string;
  isCore?: boolean;
}

const NODES: ConstellationNode[] = [
  {
    id: 'pointers',
    name: 'Pointers & Addresses',
    category: 'Memory Reference',
    x: 22,
    y: 32,
    zLayer: 25,
    invariantRule: 'Memory address validity precedes value dereferencing (*p).',
  },
  {
    id: 'dynamic-memory',
    name: 'Dynamic Memory & Heap',
    category: 'Runtime Allocation',
    x: 50,
    y: 50,
    zLayer: 40,
    isCore: true,
    invariantRule: 'malloc() blocks must retain active reference pointers until free().',
  },
  {
    id: 'linked-lists',
    name: 'Linked List Invariants',
    category: 'Linear Structures',
    x: 78,
    y: 35,
    zLayer: 20,
    invariantRule: 'Preserve predecessor address before repointing head pointers.',
  },
  {
    id: 'recursion',
    name: 'Recursive Call Stack',
    category: 'Control Flow',
    x: 28,
    y: 72,
    zLayer: 15,
    invariantRule: 'Base condition must guarantee frame termination depth bounds.',
  },
  {
    id: 'trees',
    name: 'Binary Trees & BSTs',
    category: 'Hierarchical',
    x: 72,
    y: 72,
    zLayer: 30,
    invariantRule: 'Subtree invariants left < root < right must persist across mutations.',
  },
];

const EDGES = [
  { from: 'pointers', to: 'dynamic-memory', label: 'Reference Lifetime' },
  { from: 'dynamic-memory', to: 'linked-lists', label: 'Heap Allocation' },
  { from: 'pointers', to: 'linked-lists', label: 'Reachability Chains' },
  { from: 'dynamic-memory', to: 'recursion', label: 'Stack vs Heap' },
  { from: 'linked-lists', to: 'trees', label: 'Branch Induction' },
  { from: 'recursion', to: 'trees', label: 'Traversal Frames' },
];

export const ConceptConstellationVisual: React.FC = () => {
  const [is3DMode, setIs3DMode] = useState(false);
  const [activeNodeId, setActiveNodeId] = useState<string>('dynamic-memory');

  const activeNode = NODES.find((n) => n.id === activeNodeId) || NODES[1];

  return (
    <div className="relative rounded-xl border border-stone-200 bg-white p-4 sm:p-6 text-stone-900 shadow-xs overflow-hidden">
      {/* Background Grid Pattern */}
      <div
        className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none opacity-60"
        aria-hidden="true"
      />

      {/* Header controls: Title and 2D/3D toggle */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-stone-200 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-teal-600" />
          <span className="text-xs font-mono font-semibold tracking-wider uppercase text-stone-800">
            Algorithmic Invariant Constellation
          </span>
          <span className="text-[10px] font-mono text-stone-600 bg-stone-100 border border-stone-200 px-2 py-0.5 rounded">
            Fast Static & Isometric 3D
          </span>
        </div>

        {/* View Mode Toggle Button */}
        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-lg border border-stone-200 text-xs">
          <button
            onClick={() => setIs3DMode(false)}
            className={`px-2.5 py-1 rounded font-mono text-[11px] transition-colors cursor-pointer ${
              !is3DMode
                ? 'bg-white text-stone-900 font-bold shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
            aria-pressed={!is3DMode}
          >
            2D Topology
          </button>
          <button
            onClick={() => setIs3DMode(true)}
            className={`px-2.5 py-1 rounded font-mono text-[11px] transition-colors flex items-center gap-1 cursor-pointer ${
              is3DMode
                ? 'bg-white text-teal-800 border border-teal-200 font-bold shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
            aria-pressed={is3DMode}
          >
            <Layers className="w-3 h-3" />
            Isometric 3D
          </button>
        </div>
      </div>

      {/* Main Interactive Graphic Viewport */}
      <div
        className="relative w-full h-72 sm:h-84 rounded-lg bg-stone-50 border border-stone-200 flex items-center justify-center overflow-hidden"
        style={{ perspective: is3DMode ? '900px' : 'none' }}
      >
        <div
          className={`relative w-full h-full transition-all duration-500 motion-reduce:transform-none ${
            is3DMode
              ? 'scale-90 [transform:rotateX(26deg)_rotateZ(-8deg)_translateZ(10px)] [transform-style:preserve-3d]'
              : ''
          }`}
        >
          {/* SVG Vector Edges Connecting Invariant Nodes */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
            {EDGES.map((edge, idx) => {
              const fromNode = NODES.find((n) => n.id === edge.from)!;
              const toNode = NODES.find((n) => n.id === edge.to)!;
              const isHighlighted =
                activeNodeId === edge.from || activeNodeId === edge.to;

              return (
                <g key={idx}>
                  <line
                    x1={`${fromNode.x}%`}
                    y1={`${fromNode.y}%`}
                    x2={`${toNode.x}%`}
                    y2={`${toNode.y}%`}
                    stroke={isHighlighted ? '#0d9488' : '#94a3b8'}
                    strokeWidth={isHighlighted ? '2' : '1.25'}
                    strokeDasharray={isHighlighted ? 'none' : '4 3'}
                    strokeOpacity={isHighlighted ? '1' : '0.6'}
                    className="transition-colors duration-300"
                  />
                </g>
              );
            })}
          </svg>

          {/* Interactive Constellation Nodes */}
          {NODES.map((node) => {
            const isSelected = activeNodeId === node.id;

            return (
              <button
                key={node.id}
                onClick={() => setActiveNodeId(node.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveNodeId(node.id);
                  }
                }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-lg transition-all duration-200 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-stone-400 ${
                  isSelected
                    ? 'scale-110 z-30 ring-2 ring-teal-600 bg-white text-stone-900 shadow-md font-bold'
                    : 'hover:scale-105 z-20 bg-white/95 border border-stone-200 text-stone-700 shadow-xs hover:border-stone-400'
                }`}
                style={{
                  left: `${node.x}%`,
                  top: `${node.y}%`,
                  transform: is3DMode
                    ? `translate(-50%, -50%) translateZ(${isSelected ? node.zLayer + 15 : node.zLayer}px)`
                    : undefined,
                }}
                aria-label={`Concept: ${node.name}. Invariant: ${node.invariantRule}`}
              >
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isSelected
                        ? 'bg-teal-600 ring-2 ring-teal-200'
                        : node.isCore
                        ? 'bg-amber-600'
                        : 'bg-stone-400'
                    }`}
                  />
                  <span className="text-xs font-mono">
                    {node.name}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Node Invariant Footer Banner */}
      <div className="relative z-10 mt-4 p-3.5 rounded-lg bg-stone-50 border border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-stone-900">{activeNode.name}</span>
            <span className="text-[10px] font-mono text-teal-800 bg-teal-50 border border-teal-200 px-1.5 py-0.2 rounded">
              {activeNode.category}
            </span>
          </div>
          <p className="text-stone-600 text-[11px] font-mono">
            Invariant Rule: <span className="text-stone-800 font-sans italic">"{activeNode.invariantRule}"</span>
          </p>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-stone-500 font-mono">
          <Eye className="w-3.5 h-3.5 text-teal-600" />
          Click nodes to inspect invariant relationships
        </div>
      </div>
    </div>
  );
};
