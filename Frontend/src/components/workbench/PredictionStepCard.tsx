import React, { useState } from 'react';
import type { PredictionPrompt, PredictionOption } from '../../types/workbenchTrace';
import { Card, CardHeader, CardBody } from '../common/Card';
import { Badge } from '../common/Badge';
import { HelpCircle, CheckCircle2, AlertCircle } from 'lucide-react';

interface PredictionStepCardProps {
  prediction: PredictionPrompt;
  onSelectOption?: (option: PredictionOption) => void;
}

export const PredictionStepCard: React.FC<PredictionStepCardProps> = ({
  prediction,
  onSelectOption,
}) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  const selectedOption = prediction.options.find((o) => o.id === selectedOptionId);

  const handleSelect = (option: PredictionOption) => {
    setSelectedOptionId(option.id);
    if (onSelectOption) {
      onSelectOption(option);
    }
  };

  return (
    <Card className="border-stone-200 bg-white shadow-xs">
      <CardHeader
        className="bg-stone-50/70 border-b border-stone-200"
        action={
          <Badge variant="teal" size="sm">
            Active Prediction Check
          </Badge>
        }
      >
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-stone-700" />
          <h4 className="font-semibold text-stone-900 text-sm">
            Predict Next Invariant Step
          </h4>
        </div>
      </CardHeader>

      <CardBody className="p-4 sm:p-5 space-y-4">
        <div>
          <h5 className="text-sm font-semibold text-stone-900 leading-snug">
            {prediction.question}
          </h5>
          <p className="text-xs text-stone-500 mt-1 leading-relaxed">
            {prediction.promptContext}
          </p>
        </div>

        {/* Options */}
        <div className="space-y-2">
          {prediction.options.map((option) => {
            const isSelected = selectedOptionId === option.id;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleSelect(option)}
                aria-pressed={isSelected}
                className={`w-full text-left p-3.5 rounded-lg border text-xs sm:text-sm font-mono transition-all flex items-start gap-3 cursor-pointer ${
                  isSelected
                    ? option.isCorrect
                      ? 'bg-teal-50 border-teal-300 text-teal-950 font-semibold ring-1 ring-teal-300'
                      : 'bg-amber-50 border-amber-300 text-amber-950 font-semibold ring-1 ring-amber-300'
                    : 'bg-white border-stone-200 text-stone-800 hover:border-stone-300 hover:bg-stone-50'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full border mt-0.5 shrink-0 flex items-center justify-center text-[10px] ${
                    isSelected
                      ? option.isCorrect
                        ? 'border-teal-700 bg-teal-700 text-white'
                        : 'border-amber-700 bg-amber-700 text-white'
                      : 'border-stone-300 bg-white'
                  }`}
                >
                  {isSelected && '✓'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="leading-snug">{option.text}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Option Feedback Note */}
        {selectedOption && (
          <div
            className={`p-3.5 rounded-lg border text-xs leading-relaxed animate-in fade-in duration-200 flex items-start gap-2.5 ${
              selectedOption.isCorrect
                ? 'bg-teal-50 border-teal-200 text-teal-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}
          >
            {selectedOption.isCorrect ? (
              <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            )}
            <div>
              <span className="font-semibold block mb-0.5 font-sans">
                {selectedOption.isCorrect ? 'Correct Deduction' : 'Misconception Trap'}
              </span>
              <span>{selectedOption.conceptualExplanation}</span>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
};
