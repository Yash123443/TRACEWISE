import React, { useState } from 'react';
import type { ConceptNode } from '../../types/conceptGraph';
import { Card, CardHeader, CardBody } from '../common/Card';
import { Button } from '../common/Button';
import { StatusIndicator } from './StatusIndicator';
import {
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Code2,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';

interface ConceptDetailPanelProps {
  concept: ConceptNode;
  allNodes: ConceptNode[];
  onSelectConceptId: (id: string) => void;
  onLaunchActivity: (activityTitle: string) => void;
  onCloseMobileDrawer?: () => void;
}

export const ConceptDetailPanel: React.FC<ConceptDetailPanelProps> = ({
  concept,
  allNodes,
  onSelectConceptId,
  onLaunchActivity,
  onCloseMobileDrawer,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'misconceptions' | 'syntax'>('overview');

  const getNodeById = (id: string): ConceptNode | undefined =>
    allNodes.find((n) => n.id === id);

  return (
    <Card className="border-stone-200 h-full flex flex-col shadow-xs bg-white text-stone-900 overflow-hidden">
      {/* Detail Header */}
      <CardHeader
        className="border-b border-stone-200 bg-stone-50/70"
        action={
          <div className="flex items-center gap-2">
            <StatusIndicator status={concept.demoLearnerState.status} size="sm" />
            {onCloseMobileDrawer && (
              <button
                type="button"
                onClick={onCloseMobileDrawer}
                className="lg:hidden p-1 text-stone-400 hover:text-stone-700 rounded hover:bg-stone-100 cursor-pointer"
                aria-label="Close details"
              >
                ✕
              </button>
            )}
          </div>
        }
      >
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-stone-600 bg-stone-100 px-2 py-0.5 rounded border border-stone-200 font-medium">
            {concept.category} • Tier {concept.tier}
          </span>
          <h2 className="text-base sm:text-lg font-bold text-stone-900 mt-1 tracking-tight">
            {concept.title}
          </h2>
        </div>
      </CardHeader>

      {/* Tabs */}
      <div className="flex items-center gap-1 px-4 pt-1.5 border-b border-stone-200 text-xs bg-stone-50/50">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`px-3 py-2 border-b-2 font-medium transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'border-stone-900 text-stone-900 font-bold'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          Overview & Prerequisites
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('misconceptions')}
          className={`px-3 py-2 border-b-2 font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'misconceptions'
              ? 'border-amber-600 text-amber-800 font-bold'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <span>C Traps</span>
          <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-800 border border-amber-300 text-[10px] flex items-center justify-center font-bold">
            {concept.misconceptions.length}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('syntax')}
          className={`px-3 py-2 border-b-2 font-medium transition-all cursor-pointer ${
            activeTab === 'syntax'
              ? 'border-stone-900 text-stone-900 font-bold'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          C Syntax Signature
        </button>
      </div>

      {/* Detail Content Body */}
      <CardBody className="p-4 sm:p-5 space-y-5 flex-1 overflow-y-auto text-xs">
        {/* Demo Learner State Card */}
        <div className="p-3.5 rounded-lg bg-stone-50 border border-stone-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-stone-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-stone-700" />
              Demo Learner Diagnostic State
            </span>
            <span className="font-mono text-[10px] text-stone-500 bg-white px-2 py-0.5 rounded border border-stone-200">
              Demo Fixture
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px] text-stone-800">
            <div className="bg-white p-2.5 rounded-md border border-stone-200">
              <span className="text-stone-500 text-[10px] block uppercase font-sans">Retention Score:</span>
              <strong className="text-stone-900 text-sm">
                {concept.demoLearnerState.retentionEstimatePercent}%
              </strong>
            </div>
            <div className="bg-white p-2.5 rounded-md border border-stone-200">
              <span className="text-stone-500 text-[10px] block uppercase font-sans">Cohort Benchmark:</span>
              <strong className="text-stone-900 text-sm">
                {concept.demoLearnerState.demographicCohortAveragePercent}%
              </strong>
            </div>
          </div>

          <p className="text-[10px] text-stone-500 italic">
            * Values are delivered from demographic cohort fixture data. Mastery calculations are not fabricated in the UI.
          </p>
        </div>

        {/* Tab Content: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-stone-900 mb-1">Concept Rationale</h3>
              <p className="text-stone-700 leading-relaxed text-xs">
                {concept.detailedDescription}
              </p>
            </div>

            {/* Prerequisites */}
            <div>
              <span className="font-semibold text-stone-800 uppercase tracking-wider text-[11px] block mb-2">
                Prerequisites (Must master before this concept):
              </span>
              {concept.prerequisites.length === 0 ? (
                <div className="text-stone-500 italic text-[11px] p-2 bg-stone-50 rounded-md border border-stone-200">
                  Foundational entry concept. No prerequisite dependencies required.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {concept.prerequisites.map((prereqId) => {
                    const prereqNode = getNodeById(prereqId);
                    if (!prereqNode) return null;
                    return (
                      <button
                        key={prereqId}
                        type="button"
                        onClick={() => onSelectConceptId(prereqId)}
                        className="p-2.5 rounded-lg border border-stone-200 hover:border-stone-400 bg-white hover:bg-stone-50 transition-all text-left flex items-center justify-between gap-2 shadow-2xs group cursor-pointer"
                      >
                        <div>
                          <div className="font-semibold text-stone-900 text-[11px] group-hover:text-stone-700">
                            {prereqNode.title}
                          </div>
                          <span className="text-[10px] text-stone-500 font-mono">
                            Tier {prereqNode.tier}
                          </span>
                        </div>
                        <StatusIndicator status={prereqNode.demoLearnerState.status} size="sm" showLabel={false} />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Dependents / Unlocks */}
            <div>
              <span className="font-semibold text-stone-800 uppercase tracking-wider text-[11px] block mb-2">
                Direct Downstream Dependents (Unlocks next):
              </span>
              {concept.dependents.length === 0 ? (
                <div className="text-stone-500 italic text-[11px] p-2 bg-stone-50 rounded-md border border-stone-200">
                  Terminal advanced algorithm layer.
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {concept.dependents.map((depId) => {
                    const depNode = getNodeById(depId);
                    if (!depNode) return null;
                    return (
                      <button
                        key={depId}
                        type="button"
                        onClick={() => onSelectConceptId(depId)}
                        className="px-2.5 py-1 rounded-md border border-stone-200 text-stone-700 bg-white hover:bg-stone-50 hover:border-stone-300 transition-colors flex items-center gap-1.5 cursor-pointer text-xs"
                      >
                        <span>{depNode.title}</span>
                        <ArrowUpRight className="w-3 h-3 text-stone-500" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab Content: Misconceptions */}
        {activeTab === 'misconceptions' && (
          <div className="space-y-3">
            <p className="text-xs text-stone-500">
              Common C syllabus stumbling blocks and invariant traps:
            </p>

            {concept.misconceptions.map((misc) => (
              <div
                key={misc.id}
                className="p-3.5 rounded-lg border border-amber-200 bg-amber-50/30 space-y-2 text-stone-900"
              >
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <h4 className="font-semibold text-stone-900 text-xs sm:text-sm">
                    {misc.title}
                  </h4>
                </div>

                <p className="text-stone-700 leading-relaxed text-xs pl-6">
                  {misc.explanation}
                </p>

                {misc.cCodeIllustration && (
                  <div className="pl-6 pt-1">
                    <pre className="p-2.5 rounded-md bg-stone-900 text-stone-100 font-mono text-[11px] overflow-x-auto leading-relaxed border border-stone-800">
                      {misc.cCodeIllustration}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Tab Content: Syntax */}
        {activeTab === 'syntax' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-stone-900 flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-stone-700" />
                Idiomatic C Declaration & Syntax Signature
              </span>
              <span className="text-[10px] font-mono text-stone-500">C99 / C11 Standard</span>
            </div>

            <pre className="p-3.5 rounded-lg bg-stone-900 text-stone-100 font-mono text-xs leading-relaxed overflow-x-auto border border-stone-800">
              {concept.cSyntaxSignature}
            </pre>

            <p className="text-xs text-stone-500 leading-relaxed">
              Use this canonical syntax template when formulating memory invariants and trace hypotheses.
            </p>
          </div>
        )}

        {/* Next Recommended Activity Card */}
        <div className="p-4 rounded-lg bg-stone-50 border border-stone-200 space-y-2.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-stone-900 flex items-center gap-1.5 text-xs">
              <Sparkles className="w-3.5 h-3.5 text-stone-700" />
              Target Diagnostic Activity
            </span>
            <span className="text-[11px] font-mono text-stone-600 bg-white px-2 py-0.5 rounded border border-stone-200">
              ~{concept.nextActivity.estimatedMinutes} min drill
            </span>
          </div>

          <h4 className="font-semibold text-stone-900 text-xs sm:text-sm">
            {concept.nextActivity.title}
          </h4>

          <p className="text-xs text-stone-600 leading-relaxed">
            {concept.nextActivity.prompt}
          </p>

          <Button
            variant="primary"
            size="sm"
            onClick={() => onLaunchActivity(concept.nextActivity.title)}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            className="w-full text-xs font-medium"
          >
            Launch Activity in Studio
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};
