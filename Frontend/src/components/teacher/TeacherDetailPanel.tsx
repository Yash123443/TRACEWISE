import React, { useEffect } from 'react';
import type { ConceptMasteryAggregate, MisconceptionPattern } from '../../types/teacherAnalytics';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import {
  X,
  Code2,
  HelpCircle,
  AlertTriangle,
  CheckCircle2,
  Layers,
  GraduationCap,
  BookOpen,
} from 'lucide-react';

interface TeacherDetailPanelProps {
  selectedConcept: ConceptMasteryAggregate | null;
  selectedMisconception: MisconceptionPattern | null;
  onClose: () => void;
  onOpenWorkbench: () => void;
  onOpenStudioQuestion: (questionId: string) => void;
}

export const TeacherDetailPanel: React.FC<TeacherDetailPanelProps> = ({
  selectedConcept,
  selectedMisconception,
  onClose,
  onOpenWorkbench,
  onOpenStudioQuestion,
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!selectedConcept && !selectedMisconception) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Teacher analytics detail inspector"
      className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white shadow-2xl border-l border-stone-200 text-stone-900 flex flex-col animate-in slide-in-from-right duration-200"
    >
      {/* Panel Header */}
      <div className="p-4 sm:p-5 border-b border-stone-200 bg-stone-50/80 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-stone-100 border border-stone-200 text-stone-800 flex items-center justify-center">
            {selectedConcept ? <BookOpen className="w-4 h-4 text-stone-700" /> : <AlertTriangle className="w-4 h-4 text-amber-700" />}
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-semibold block">
              Supporting Demo Diagnostic Data
            </span>
            <h3 className="font-semibold text-stone-900 text-sm sm:text-base">
              {selectedConcept ? selectedConcept.conceptName : selectedMisconception?.patternTitle}
            </h3>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
          aria-label="Close inspector panel"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Panel Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 text-xs">
        {/* ================= CONCEPT DETAIL VIEW ================= */}
        {selectedConcept && (
          <div className="space-y-5">
            {/* Concept Category & Benchmark Metrics */}
            <div className="p-3.5 rounded-lg border border-stone-200 bg-stone-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-stone-500 font-mono text-[11px] uppercase">
                  Category: {selectedConcept.category}
                </span>
                <Badge
                  variant={
                    selectedConcept.masteryTier === 'solidified'
                      ? 'teal'
                      : selectedConcept.masteryTier === 'developing'
                      ? 'blue'
                      : 'amber'
                  }
                  size="sm"
                >
                  {selectedConcept.masteryTierLabel}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-xs">
                <div className="p-2.5 rounded-md bg-white border border-stone-200">
                  <span className="text-[10px] text-stone-500 block uppercase font-sans">Class Average</span>
                  <span className="font-bold text-stone-900 text-sm">{selectedConcept.classMasteryPercent}%</span>
                </div>
                <div className="p-2.5 rounded-md bg-white border border-stone-200">
                  <span className="text-[10px] text-stone-500 block uppercase font-sans">Benchmark Target</span>
                  <span className="font-bold text-stone-900 text-sm">{selectedConcept.benchmarkTargetPercent}%</span>
                </div>
              </div>
            </div>

            {/* Student Distribution Breakdown */}
            <div className="space-y-2">
              <span className="font-semibold text-stone-800 uppercase tracking-wider text-[11px] block">
                Cohort Student Distribution (N=48):
              </span>

              <div className="p-3.5 rounded-lg border border-stone-200 bg-stone-50/50 space-y-2.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-teal-800 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-700" /> Solidified Mastery
                  </span>
                  <span className="font-mono font-bold text-stone-900">
                    {selectedConcept.distribution.solidifiedStudents} Students
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-blue-800 flex items-center gap-1 font-medium">
                    <HelpCircle className="w-3.5 h-3.5 text-blue-700" /> Developing Competency
                  </span>
                  <span className="font-mono font-bold text-stone-900">
                    {selectedConcept.distribution.developingStudents} Students
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-amber-800 flex items-center gap-1 font-medium">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-700" /> Critical Learning Gap
                  </span>
                  <span className="font-mono font-bold text-stone-900">
                    {selectedConcept.distribution.criticalGapStudents} Students
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <span className="font-semibold text-stone-800 uppercase tracking-wider text-[11px] block">
                Core Conceptual Scope:
              </span>
              <p className="text-stone-700 leading-relaxed bg-stone-50 p-3.5 rounded-lg border border-stone-200">
                {selectedConcept.supportingDetail.description}
              </p>
            </div>

            {/* Primary Failure Point */}
            <div className="space-y-1">
              <span className="font-semibold text-rose-800 uppercase tracking-wider text-[11px] block">
                Primary Failure Point Identified:
              </span>
              <p className="text-rose-900 leading-relaxed bg-rose-50 p-3.5 rounded-lg border border-rose-200">
                {selectedConcept.supportingDetail.primaryFailurePoint}
              </p>
            </div>

            {/* Representative Assessment Task */}
            <div className="space-y-1">
              <span className="font-semibold text-stone-800 uppercase tracking-wider text-[11px] block">
                Representative Diagnostic Task:
              </span>
              <p className="text-stone-800 font-mono text-[11px] bg-stone-50 p-3 rounded-lg border border-stone-200">
                {selectedConcept.supportingDetail.representativeAssessmentTask}
              </p>
            </div>

            {/* Sample Student Error Snippet */}
            <div className="space-y-1">
              <span className="font-semibold text-stone-800 uppercase tracking-wider text-[11px] block flex items-center gap-1">
                <Code2 className="w-3.5 h-3.5 text-stone-600" />
                Sample Recurring Student C Trap:
              </span>
              <pre className="p-3.5 rounded-lg bg-stone-900 text-stone-100 font-mono text-[11px] leading-relaxed overflow-x-auto border border-stone-800">
                {selectedConcept.supportingDetail.sampleErrorSnippet}
              </pre>
            </div>

            {/* Subtopics */}
            <div className="space-y-1.5">
              <span className="font-semibold text-stone-800 uppercase tracking-wider text-[11px] block">
                Assessed Invariant Subtopics:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedConcept.supportingDetail.affectedSubtopics.map((sub, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-md bg-stone-100 text-stone-700 border border-stone-200 text-[11px] font-mono"
                  >
                    {sub}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= MISCONCEPTION DETAIL VIEW ================= */}
        {selectedMisconception && (
          <div className="space-y-5">
            {/* Header info */}
            <div className="p-3.5 rounded-lg border border-amber-200 bg-amber-50/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase text-amber-900 font-semibold">
                  Concept: {selectedMisconception.conceptName}
                </span>
                <Badge variant="red" size="sm">
                  {selectedMisconception.severityLabel}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-xs">
                <div className="p-2.5 rounded-md bg-white border border-amber-200">
                  <span className="text-[10px] text-stone-500 block uppercase font-sans">Affected Students</span>
                  <span className="font-bold text-stone-900 text-sm">
                    {selectedMisconception.studentCount} / {selectedMisconception.totalCohort} ({selectedMisconception.prevalencePercent}%)
                  </span>
                </div>
                <div className="p-2.5 rounded-md bg-white border border-amber-200">
                  <span className="text-[10px] text-stone-500 block uppercase font-sans">Submissions Flagged</span>
                  <span className="font-bold text-amber-800 text-sm">{selectedMisconception.totalOccurrences} times</span>
                </div>
              </div>
            </div>

            {/* Invariant Violation Explanation */}
            <div className="space-y-1">
              <span className="font-semibold text-stone-800 uppercase tracking-wider text-[11px] block">
                Algorithmic Invariant Flaw:
              </span>
              <p className="text-stone-700 leading-relaxed bg-stone-50 p-3.5 rounded-lg border border-stone-200">
                {selectedMisconception.invariantViolation}
              </p>
            </div>

            {/* Flawed C Code Trap Snippet */}
            <div className="space-y-1">
              <span className="font-semibold text-rose-800 uppercase tracking-wider text-[11px] block flex items-center gap-1">
                <Code2 className="w-3.5 h-3.5" />
                Flawed Student C Anti-Pattern:
              </span>
              <pre className="p-3.5 rounded-lg bg-stone-900 text-rose-300 font-mono text-[11px] leading-relaxed overflow-x-auto border border-stone-800">
                {selectedMisconception.cCodeTrapSnippet}
              </pre>
            </div>

            {/* Diagnostic Socratic Prompt */}
            <div className="space-y-1">
              <span className="font-semibold text-stone-800 uppercase tracking-wider text-[11px] block flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5 text-stone-600" />
                Recommended Diagnostic Socratic Question for Reteach:
              </span>
              <div className="p-3.5 rounded-lg border border-stone-300 bg-stone-50 text-stone-900 font-medium italic leading-relaxed">
                "{selectedMisconception.diagnosticSocraticPrompt}"
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Panel Footer with Direct Actions */}
      <div className="p-4 border-t border-stone-200 bg-stone-50/70 flex items-center justify-between gap-3">
        <Button variant="subtle" size="sm" onClick={onClose} className="text-xs">
          Dismiss
        </Button>

        <div className="flex items-center gap-2">
          {selectedMisconception?.targetStudioQuestionId && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                onOpenStudioQuestion(selectedMisconception.targetStudioQuestionId!);
                onClose();
              }}
              className="text-xs"
            >
              <GraduationCap className="w-3.5 h-3.5 mr-1 text-stone-700" />
              Practice in Studio
            </Button>
          )}

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              onOpenWorkbench();
              onClose();
            }}
            className="text-xs"
          >
            <Layers className="w-3.5 h-3.5 mr-1" />
            Open Memory Workbench
          </Button>
        </div>
      </div>
    </div>
  );
};
