import React from 'react';
import type { LearningQuestion } from '../../types/tracewise';
import { Card, CardBody, CardHeader } from '../common/Card';
import { Badge } from '../common/Badge';
import { BookOpen } from 'lucide-react';

interface QuestionCardProps {
  question: LearningQuestion;
  questionsList: LearningQuestion[];
  selectedOption?: string | null;
  onSelectOption?: (option: string) => void;
  onSelectQuestion: (question: LearningQuestion) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questionsList,
  selectedOption,
  onSelectOption,
  onSelectQuestion,
}) => (
  <Card className="border-stone-200 bg-white text-stone-900 h-full flex flex-col shadow-xs">
    <CardHeader className="border-b border-stone-200 bg-stone-50/60" action={
      <select
        aria-label="Select DSA Question"
        value={question.id}
        onChange={(event) => {
          const found = questionsList.find((item) => item.id === event.target.value);
          if (found) onSelectQuestion(found);
        }}
        className="text-xs bg-white border border-stone-300 rounded-md px-2.5 py-1 text-stone-800 font-medium"
      >
        {questionsList.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
      </select>
    }>
      <div className="flex items-center gap-2">
        <BookOpen className="w-4 h-4 text-stone-700" />
        <h2 className="font-semibold text-stone-900 text-sm">Problem Specification</h2>
      </div>
    </CardHeader>
    <CardBody className="p-5 space-y-4 flex-1">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="teal" size="sm">{question.category}</Badge>
        <Badge variant="amber" size="sm">{question.difficulty}</Badge>
      </div>
      <p className="text-sm text-stone-800 leading-relaxed whitespace-pre-line">{question.statement}</p>
      <p className="text-xs text-stone-600">Concept: {question.conceptName ?? question.category}</p>
      {question.options?.length ? (
        <fieldset className="space-y-2" aria-label="Answer options">
          <legend className="text-sm font-medium text-stone-800">Choose an answer</legend>
          {question.options.map((option, index) => (
            <label key={`${index}-${option}`} className="flex items-start gap-3 rounded-lg border border-stone-200 p-3 text-sm hover:bg-stone-50 cursor-pointer">
              <input
                type="radio"
                name={`answer-${question.id}`}
                value={option}
                checked={selectedOption === option}
                onChange={() => onSelectOption?.(option)}
                className="mt-0.5 accent-stone-900"
              />
              <span>{option}</span>
            </label>
          ))}
        </fieldset>
      ) : null}
    </CardBody>
  </Card>
);
