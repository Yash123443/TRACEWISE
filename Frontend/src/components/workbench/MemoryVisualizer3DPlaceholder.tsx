import React, { useState } from 'react';
import type { MemorySnapshot } from '../../types/workbenchTrace';
import { Badge } from '../common/Badge';
import { MemoryHeapCanvas3D } from '../3d/MemoryHeapCanvas3D';
import { Box, Layers, ShieldCheck } from 'lucide-react';

export interface MemoryVisualizer3DProps {
  snapshot: MemorySnapshot;
  activeStepLabel: string;
  onNodeClick?: (nodeId: string) => void;
}

/**
 * 3D Memory Visualizer for Tracewise Workbench.
 * Renders a hardware-accelerated WebGL Three.js canvas with restrained studio lighting,
 * high-contrast memory blocks, and pointer curves.
 */
export const MemoryVisualizer3DPlaceholder: React.FC<MemoryVisualizer3DProps> = ({
  snapshot,
  activeStepLabel,
}) => {
  const [showWireframe, setShowWireframe] = useState(false);
  const { unreachableNodeIds, hasCycle } = snapshot;

  return (
    <div className="bg-white rounded-xl border border-stone-300 text-stone-900 p-5 sm:p-6 shadow-xs relative overflow-hidden flex flex-col justify-between">
      {/* 3D Visualizer Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-200 relative z-10">
        <div className="flex items-center gap-2">
          <Box className="w-4 h-4 text-stone-700" />
          <h3 className="text-xs sm:text-sm font-semibold tracking-tight text-stone-900">
            Spatial 3D Memory Perspective
          </h3>
          <span className="text-[10px] font-mono text-stone-600 bg-stone-100 px-2 py-0.5 rounded border border-stone-200 font-medium">
            WebGL Three.js Canvas
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Badge variant="teal" size="sm">
            {activeStepLabel}
          </Badge>

          {unreachableNodeIds.length > 0 && (
            <Badge variant="red" size="sm">
              {unreachableNodeIds.length} Unreachable Nodes
            </Badge>
          )}

          {hasCycle && (
            <Badge variant="amber" size="sm">
              Cycle Detected
            </Badge>
          )}
        </div>
      </div>

      {/* 3D WebGL Viewport */}
      <div className="my-4 h-[360px] sm:h-[440px] w-full rounded-lg bg-stone-50 border border-stone-200 relative overflow-hidden">
        <MemoryHeapCanvas3D />
      </div>

      {/* 3D Visualizer Controls & Invariant Footer */}
      <div className="pt-3 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-500 font-mono">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-stone-600" />
          <span>Interactive Perspective: Move cursor or scroll to inspect memory layout</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowWireframe(!showWireframe)}
            className="text-[11px] text-stone-600 hover:text-stone-900 transition-colors cursor-pointer flex items-center gap-1"
          >
            <Layers className="w-3 h-3" />
            <span>Coordinate Plane Active</span>
          </button>
        </div>
      </div>
    </div>
  );
};
