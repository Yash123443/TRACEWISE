import React, { useState } from 'react';
import { C_CONCEPT_GRAPH_FIXTURE } from '../../mock/cConceptGraphFixture';
import { ConceptGraph2D } from './ConceptGraph2D';
import { ConceptGraph3DPlaceholder } from './ConceptGraph3DPlaceholder';
import { ConceptDetailPanel } from './ConceptDetailPanel';
import {
  Layers,
  Box,
  Search,
  Filter,
  ShieldCheck,
  Compass,
} from 'lucide-react';

interface ConceptMapScreenProps {
  onSelectConceptToLearn: (conceptName: string) => void;
}

export const ConceptMapScreen: React.FC<ConceptMapScreenProps> = ({
  onSelectConceptToLearn,
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('pointers');
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fixture = C_CONCEPT_GRAPH_FIXTURE;

  // Filter nodes by search query
  const searchedNodes = fixture.nodes.filter((n) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      n.title.toLowerCase().includes(q) ||
      n.category.toLowerCase().includes(q) ||
      n.summary.toLowerCase().includes(q)
    );
  });

  const selectedNode =
    fixture.nodes.find((n) => n.id === selectedNodeId) || fixture.nodes[0];

  const handleSelectNode = (nodeId: string) => {
    setSelectedNodeId(nodeId);
  };

  // Status counts from fixture (NOT calculated dynamically)
  const strongCount = fixture.nodes.filter((n) => n.demoLearnerState.status === 'strong').length;
  const learningCount = fixture.nodes.filter((n) => n.demoLearnerState.status === 'learning').length;
  const revisionCount = fixture.nodes.filter((n) => n.demoLearnerState.status === 'needs-revision').length;
  const notStartedCount = fixture.nodes.filter((n) => n.demoLearnerState.status === 'not-started').length;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-in fade-in duration-150">
      {/* Header & View Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900">
              C Syllabus DSA Concept Dependency Map
            </h1>
            <span className="font-mono text-[10px] text-stone-600 bg-stone-100 px-2.5 py-0.5 rounded border border-stone-200 font-medium">
              C99/C11 Foundation
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-500">
            Interactive prerequisite network connecting memory addresses, self-referential structs, ADTs, and algorithms.
          </p>
        </div>

        {/* View Mode Switcher: 2D Accessible vs 3D Spatial Slot */}
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
            <span>2D Hierarchy</span>
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

      {/* Contract & Demographic Notice Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-lg bg-stone-100 border border-stone-200 text-xs text-stone-700">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-stone-600 shrink-0" />
          <span>
            <strong className="text-stone-900">Curriculum Model:</strong> {fixture.syllabusTitle}. States marked as simulated demo data.
          </span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[11px] text-stone-500">
          <span>{fixture.nodes.length} Core Concepts</span>
          <span>•</span>
          <span>{fixture.edges.length} Dependency Edges</span>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white border border-stone-200 rounded-xl shadow-2xs">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          <span className="text-stone-500 text-[11px] mr-1 hidden sm:inline flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter Status:
          </span>

          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-2.5 py-1 rounded-md transition-all font-medium cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-stone-900 text-white shadow-2xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            All ({fixture.nodes.length})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('strong')}
            className={`px-2.5 py-1 rounded-md transition-all font-medium cursor-pointer ${
              statusFilter === 'strong'
                ? 'bg-teal-700 text-white shadow-2xs'
                : 'text-teal-900 bg-teal-50 hover:bg-teal-100/80 border border-teal-200'
            }`}
          >
            Solidified ({strongCount})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('learning')}
            className={`px-2.5 py-1 rounded-md transition-all font-medium cursor-pointer ${
              statusFilter === 'learning'
                ? 'bg-blue-700 text-white shadow-2xs'
                : 'text-blue-900 bg-blue-50 hover:bg-blue-100/80 border border-blue-200'
            }`}
          >
            Learning ({learningCount})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('needs-revision')}
            className={`px-2.5 py-1 rounded-md transition-all font-medium cursor-pointer ${
              statusFilter === 'needs-revision'
                ? 'bg-amber-700 text-white shadow-2xs'
                : 'text-amber-900 bg-amber-50 hover:bg-amber-100/80 border border-amber-200'
            }`}
          >
            Needs Revision ({revisionCount})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('not-started')}
            className={`px-2.5 py-1 rounded-md transition-all font-medium cursor-pointer ${
              statusFilter === 'not-started'
                ? 'bg-stone-700 text-white shadow-2xs'
                : 'text-stone-600 bg-stone-100 hover:bg-stone-200 border border-stone-200'
            }`}
          >
            Not Started ({notStartedCount})
          </button>
        </div>

        {/* Search input */}
        <div className="relative min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search concepts or syntax..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs bg-stone-50 border border-stone-300 rounded-md pl-8 pr-3 py-1.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:bg-white"
          />
        </div>
      </div>

      {/* Main Graph & Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: 2D Graph or 3D Spatial Canvas (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {viewMode === '2d' ? (
            <ConceptGraph2D
              nodes={searchedNodes}
              edges={fixture.edges}
              selectedNodeId={selectedNodeId}
              onSelectNode={handleSelectNode}
              statusFilter={statusFilter}
            />
          ) : (
            <ConceptGraph3DPlaceholder
              nodes={searchedNodes}
              edges={fixture.edges}
              selectedNodeId={selectedNodeId}
              onSelectNode={handleSelectNode}
            />
          )}

          {/* Graph Legend & Navigation accessibility note */}
          <div className="p-3.5 rounded-lg bg-stone-50 border border-stone-200 text-xs text-stone-600 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-stone-600" />
              <span>
                <strong>Prerequisite Rules:</strong> Solid arrows represent strict compiler prerequisites; dashed represent supporting ADT techniques.
              </span>
            </div>
            <span className="font-mono text-[11px] text-stone-500">
              Use arrow keys to jump across nodes
            </span>
          </div>
        </div>

        {/* Right: Selected Node Detail Panel (5 cols) */}
        <div className="lg:col-span-5 h-full">
          <ConceptDetailPanel
            concept={selectedNode}
            allNodes={fixture.nodes}
            onSelectConceptId={handleSelectNode}
            onLaunchActivity={onSelectConceptToLearn}
          />
        </div>
      </div>
    </main>
  );
};
