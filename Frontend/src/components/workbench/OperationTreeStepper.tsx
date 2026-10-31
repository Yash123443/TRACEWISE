import React from 'react';
import type { OperationStep } from '../../types/workbenchTrace';
import { Card, CardHeader, CardBody } from '../common/Card';
import { GitCommit, CheckCircle2, ChevronRight } from 'lucide-react';

interface OperationTreeStepperProps {
  steps: OperationStep[];
  currentStepIndex: number;
  onSelectStep: (stepIndex: number) => void;
}

export const OperationTreeStepper: React.FC<OperationTreeStepperProps> = ({
  steps,
  currentStepIndex,
  onSelectStep,
}) => {
  return (
    <Card className="border-stone-200 bg-white h-full flex flex-col shadow-xs">
      <CardHeader
        className="bg-stone-50/70 border-b border-stone-200"
        action={
          <span className="text-xs font-mono font-medium text-stone-500">
            Step {currentStepIndex + 1} of {steps.length}
          </span>
        }
      >
        <div className="flex items-center gap-2">
          <GitCommit className="w-4 h-4 text-stone-700" />
          <h3 className="font-semibold text-stone-900 text-sm">
            Supplied Operation Tree
          </h3>
        </div>
      </CardHeader>

      <CardBody className="p-4 space-y-3 flex-1 overflow-y-auto">
        <div className="relative pl-4 space-y-3 before:absolute before:left-6 before:top-3 before:bottom-3 before:w-0.5 before:bg-stone-200">
          {steps.map((step, idx) => {
            const isActive = idx === currentStepIndex;
            const isCompleted = idx < currentStepIndex;

            return (
              <button
                key={step.stepIndex}
                type="button"
                onClick={() => onSelectStep(idx)}
                className={`w-full text-left relative p-3 rounded-lg border transition-all flex items-start gap-3 select-none cursor-pointer ${
                  isActive
                    ? 'bg-stone-100 border-stone-400 ring-1 ring-stone-300 shadow-2xs'
                    : isCompleted
                    ? 'bg-stone-50/70 border-stone-200 text-stone-700 hover:bg-white hover:border-stone-300'
                    : 'bg-white border-stone-200/80 text-stone-500 opacity-80 hover:opacity-100 hover:border-stone-300'
                }`}
              >
                {/* Status Indicator Icon */}
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-mono ${
                    isActive
                      ? 'bg-stone-900 text-white font-bold'
                      : isCompleted
                      ? 'bg-teal-100 text-teal-800'
                      : 'bg-stone-100 text-stone-400'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span
                      className={`text-xs font-semibold ${
                        isActive ? 'text-stone-900 font-bold' : 'text-stone-800'
                      }`}
                    >
                      {step.label}
                    </span>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-stone-800 shrink-0" />}
                  </div>

                  <code className="text-[11px] font-mono px-1.5 py-0.5 bg-stone-100 text-stone-800 border border-stone-200 rounded block mb-1 truncate">
                    {step.codeInstruction.split('\n')[0]}
                  </code>

                  <p className="text-[11px] text-stone-500 leading-snug line-clamp-2">
                    {step.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
};
