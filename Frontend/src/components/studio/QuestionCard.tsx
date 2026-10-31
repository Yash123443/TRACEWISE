import React, { useState } from 'react';
import type { LearningQuestion } from '../../types/tracewise';
import { Card, CardHeader, CardBody } from '../common/Card';
import { Badge } from '../common/Badge';
import { BookOpen, ChevronDown, ChevronUp, Cpu, CheckCircle2 } from 'lucide-react';

interface QuestionCardProps {
  question: LearningQuestion;
  questionsList: LearningQuestion[];
  onSelectQuestion: (question: LearningQuestion) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questionsList,
  onSelectQuestion,
}) => {
  const [showConstraints, setShowConstraints] = useState(true);
  const [showExamples, setShowExamples] = useState(true);

  return (
    <Card className="border-stone-200 bg-white text-stone-900 h-full flex flex-col shadow-xs">
      <CardHeader
        className="border-b border-stone-200 bg-stone-50/60"
        action={
          <div className="flex items-center gap-2">
            <select
              aria-label="Select DSA Question"
              value={question.id}
              onChange={(e) => {
                const found = questionsList.find((q) => q.id === e.target.value);
                if (found) onSelectQuestion(found);
              }}
              className="text-xs bg-white border border-stone-300 rounded-md px-2.5 py-1 text-stone-800 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 cursor-pointer shadow-2xs"
            >
              {questionsList.map((q) => (
                <option key={q.id} value={q.id} className="text-stone-900">
                  {q.title}
                </option>
              ))}
            </select>
          </div>
        }
      >
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-stone-700" />
          <h2 className="font-semibold text-stone-900 text-sm">Problem Specification</h2>
        </div>
      </CardHeader>

      <CardBody className="p-5 overflow-y-auto space-y-4 flex-1">
        {/* Title & Metadata */}
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge variant="teal" size="sm">
              {question.category}
            </Badge>
            <Badge variant="amber" size="sm">
              {question.difficulty}
            </Badge>
            <span className="text-[11px] font-mono text-stone-600 bg-stone-100 border border-stone-200 px-2 py-0.5 rounded font-medium">
              {question.examContext}
            </span>
          </div>

          <h1 className="text-lg font-bold text-stone-900 tracking-tight">
            {question.title}
          </h1>
        </div>

        {/* Core Reasoning Goal Callout */}
        <div className="p-3.5 rounded-lg bg-stone-50 border border-stone-200 text-xs text-stone-700 space-y-1.5">
          <div className="font-semibold flex items-center gap-1.5 text-stone-900">
            <Cpu className="w-4 h-4 text-stone-700" />
            <span>Target Reasoning Objective:</span>
          </div>
          <p className="leading-relaxed text-stone-600">{question.reasoningGoal}</p>
        </div>

        {/* Problem Statement */}
        <div className="text-xs text-stone-800 leading-relaxed whitespace-pre-line bg-stone-50/50 p-3.5 rounded-lg border border-stone-200 font-sans">
          {question.statement}
        </div>

        {/* Complexity Targets */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-stone-50 border border-stone-200 text-xs font-mono">
          <div className="text-stone-600">
            Target Time: <span className="font-bold text-stone-900">{question.targetComplexity.time}</span>
          </div>
          <div className="text-stone-600">
            Target Space: <span className="font-bold text-stone-900">{question.targetComplexity.space}</span>
          </div>
        </div>

        {/* Key Invariants Checklist */}
        <div>
          <h4 className="text-xs font-semibold text-stone-700 mb-2 uppercase tracking-wider text-[11px]">
            Invariants You Must Justify:
          </h4>
          <ul className="space-y-1.5 text-xs text-stone-600">
            {question.keyInvariantsToAddress.map((inv, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 p-2 rounded-md bg-stone-50 border border-stone-200"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-700 shrink-0 mt-0.5" />
                <span className="font-mono text-stone-800 text-[11px]">{inv}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Collapsible Constraints */}
        <div className="border border-stone-200 rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => setShowConstraints(!showConstraints)}
            className="w-full px-3.5 py-2.5 bg-stone-50/60 flex items-center justify-between text-xs font-medium text-stone-800 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <span>Input Constraints & Boundary Assumptions</span>
            {showConstraints ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          {showConstraints && (
            <div className="p-3 bg-white border-t border-stone-200 space-y-1 text-xs font-mono text-stone-600">
              {question.constraints.map((c, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span className="text-stone-400">•</span>
                  <span>{c}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Collapsible Test Cases */}
        <div className="border border-stone-200 rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => setShowExamples(!showExamples)}
            className="w-full px-3.5 py-2.5 bg-stone-50/60 flex items-center justify-between text-xs font-medium text-stone-800 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <span>Reference Examples</span>
            {showExamples ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          {showExamples && (
            <div className="p-3 bg-white border-t border-stone-200 space-y-2 text-xs">
              {question.examples.map((ex, i) => (
                <div key={i} className="p-2.5 rounded-md bg-stone-50 border border-stone-200 font-mono text-[11px] space-y-1">
                  <div>
                    <span className="text-stone-500 font-sans font-medium">Input: </span>
                    <span className="text-stone-800">{ex.input}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 font-sans font-medium">Output: </span>
                    <span className="text-emerald-700 font-bold">{ex.output}</span>
                  </div>
                  {ex.explanation && (
                    <p className="text-[11px] text-stone-600 font-sans pt-1 border-t border-stone-200">
                      {ex.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
};
