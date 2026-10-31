import React, { useState } from 'react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { MemoryHeapCanvas3D } from '../3d/MemoryHeapCanvas3D';
import { ConceptConstellationVisual } from './ConceptConstellationVisual';
import {
  ArrowRight,
  GitBranch,
  Layers,
  ShieldCheck,
  Compass,
  Boxes,
  Network,
} from 'lucide-react';

interface LandingHeroProps {
  onStartLearning: () => void;
  onOpenWorkbench: () => void;
  onOpenConceptMap: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onStartLearning,
  onOpenWorkbench,
  onOpenConceptMap,
}) => {
  const [visualMode, setVisualMode] = useState<'3d-heap' | 'constellation'>('3d-heap');

  return (
    <section className="relative overflow-hidden pt-8 pb-14 sm:pt-12 sm:pb-18 lg:pb-22 border-b border-stone-200 bg-[#fbfbfa]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Hero Text & Calls to Action */}
          <div className="lg:col-span-6 space-y-6 text-left">
            {/* Mission Category Badge */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="teal" size="md" icon={<GitBranch className="w-3.5 h-3.5" />}>
                Invariant Reasoning Tutor
              </Badge>
              <span className="text-xs font-mono text-stone-600 bg-stone-100 px-2.5 py-1 rounded-full border border-stone-200">
                DSA in C & Core Systems
              </span>
            </div>

            {/* Concise Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-stone-900 leading-[1.18]">
              Understand how you{' '}
              <span className="underline decoration-teal-600 decoration-2 underline-offset-4">
                reason through memory
              </span>
              , not just whether test cases pass.
            </h1>

            {/* Pedagogical Purpose Subheading */}
            <p className="text-sm sm:text-base text-stone-600 leading-relaxed max-w-xl">
              Most coding tools only test whether an output matches a string. Tracewise models how you reason through algorithmic invariants, pointer addresses, and memory lifetimes—pinpointing exactly where conceptual confusion begins.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Button
                variant="primary"
                size="lg"
                onClick={onStartLearning}
                className="text-sm font-semibold group shadow-sm"
              >
                Start Learning
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform motion-reduce:transform-none" />
              </Button>

              <Button
                variant="secondary"
                size="lg"
                onClick={onOpenWorkbench}
                className="text-sm font-medium"
              >
                <Layers className="w-4 h-4 mr-2 text-stone-500" />
                Open Memory Workbench
              </Button>

              <Button
                variant="outline"
                size="md"
                onClick={onOpenConceptMap}
                className="text-xs text-stone-600 hover:text-stone-900"
              >
                <Compass className="w-3.5 h-3.5 mr-1.5 text-stone-400" />
                Explore Concept Map
              </Button>
            </div>

            {/* Functional Highlights */}
            <div className="pt-5 border-t border-stone-200 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-stone-600 font-medium">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-teal-50 border border-teal-200 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
                </div>
                <span>Voice & Text Invariants</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-teal-50 border border-teal-200 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
                </div>
                <span>3D Heap Tracing</span>
              </div>
              <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
                <div className="w-5 h-5 rounded bg-teal-50 border border-teal-200 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
                </div>
                <span>Spaced Misconception Queue</span>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Visual Hero */}
          <div className="lg:col-span-6 w-full space-y-3">
            {/* View Mode Switcher */}
            <div className="flex items-center justify-between pb-1">
              <span className="text-[11px] font-mono uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                <Boxes className="w-3.5 h-3.5 text-stone-600" />
                Simulated Memory Visualization
              </span>

              <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-lg border border-stone-200 text-xs font-mono">
                <button
                  onClick={() => setVisualMode('3d-heap')}
                  className={`px-2.5 py-1 rounded text-[11px] transition-colors cursor-pointer ${
                    visualMode === '3d-heap'
                      ? 'bg-white text-stone-900 border border-stone-200 font-semibold shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                  aria-pressed={visualMode === '3d-heap'}
                >
                  3D Heap Mesh
                </button>
                <button
                  onClick={() => setVisualMode('constellation')}
                  className={`px-2.5 py-1 rounded text-[11px] transition-colors flex items-center gap-1 cursor-pointer ${
                    visualMode === 'constellation'
                      ? 'bg-white text-stone-900 border border-stone-200 font-semibold shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                  aria-pressed={visualMode === 'constellation'}
                >
                  <Network className="w-3 h-3 text-stone-500" />
                  Topology
                </button>
              </div>
            </div>

            {/* Visual Canvas Display */}
            <div className="rounded-xl border border-stone-200 bg-white shadow-xs overflow-hidden">
              {visualMode === '3d-heap' ? (
                <div className="h-[380px] sm:h-[440px] w-full relative">
                  <MemoryHeapCanvas3D />
                </div>
              ) : (
                <ConceptConstellationVisual />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
