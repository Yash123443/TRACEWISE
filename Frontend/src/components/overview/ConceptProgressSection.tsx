import React, { useState } from 'react';
import type { ConceptCategoryProgress, MasteryStatus } from '../../types/tracewise';
import { Card, CardHeader, CardBody } from '../common/Card';
import { Badge } from '../common/Badge';
import { CheckCircle2, AlertTriangle, Layers } from 'lucide-react';

interface ConceptProgressSectionProps {
  progressData: ConceptCategoryProgress[];
  onSelectConcept?: (conceptName: string) => void;
}

export const ConceptProgressSection: React.FC<ConceptProgressSectionProps> = ({
  progressData,
  onSelectConcept,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(progressData[0]?.category || '');

  const activeCategoryData = progressData.find((c) => c.category === selectedCategory) || progressData[0];

  const getStatusBadge = (status: MasteryStatus) => {
    switch (status) {
      case 'solidified':
        return (
          <Badge variant="teal" size="sm" icon={<CheckCircle2 className="w-3 h-3 text-teal-700" />}>
            Solidified
          </Badge>
        );
      case 'needs-review':
        return (
          <Badge variant="amber" size="sm" icon={<AlertTriangle className="w-3 h-3 text-amber-700" />}>
            Needs Review
          </Badge>
        );
      case 'in-progress':
        return (
          <Badge variant="blue" size="sm">
            In Progress
          </Badge>
        );
      default:
        return (
          <Badge variant="gray" size="sm">
            Unattempted
          </Badge>
        );
    }
  };

  return (
    <Card className="border-stone-200">
      <CardHeader
        action={
          <span className="text-xs text-stone-500 font-mono">
            Tracks: {progressData.length}
          </span>
        }
      >
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-stone-700" />
          <h3 className="font-semibold text-stone-900 text-sm tracking-tight">
            Concept Mastery & Reasoning Progress
          </h3>
        </div>
      </CardHeader>

      <CardBody className="p-5 space-y-5">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-stone-200">
          {progressData.map((cat) => {
            const isCurrent = cat.category === selectedCategory;
            return (
              <button
                key={cat.category}
                onClick={() => setSelectedCategory(cat.category)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isCurrent
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                {cat.category}
                <span className={`ml-1.5 text-[10px] font-mono ${isCurrent ? 'text-stone-300' : 'text-stone-400'}`}>
                  {cat.averageMastery === null ? 'Not assessed' : `${cat.averageMastery}%`}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Category Summary Bar */}
        {activeCategoryData && (
          <div>
            <div className="flex items-center justify-between text-xs text-stone-600 mb-2">
              <span className="font-medium text-stone-900">
                {activeCategoryData.category} Track Health
              </span>
              <span>
                <strong className="text-stone-900">{activeCategoryData.solidifiedCount}</strong> of{' '}
                {activeCategoryData.totalConcepts} Core Invariants Verified
              </span>
            </div>

            {/* Visual Bar */}
            <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden flex border border-stone-200">
              {activeCategoryData.averageMastery !== null && <div
                className="bg-stone-800 h-full transition-all duration-300"
                style={{ width: `${activeCategoryData.averageMastery}%` }}
                title={`Average Mastery: ${activeCategoryData.averageMastery}%`}
              />}
            </div>

            {/* Sub-concepts List */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              {activeCategoryData.concepts.map((concept) => (
                <div
                  key={concept.id}
                  onClick={() => onSelectConcept && onSelectConcept(concept.name)}
                  className="p-3.5 rounded-lg border border-stone-200 bg-stone-50/50 hover:bg-white hover:border-stone-300 transition-all flex flex-col justify-between gap-3 group cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold text-stone-900 group-hover:text-stone-700 transition-colors">
                      {concept.name}
                    </span>
                    {getStatusBadge(concept.status)}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-stone-500 pt-2 border-t border-stone-100">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-stone-200 h-1.5 rounded-full overflow-hidden">
                        {concept.masteryPercent !== null && <div
                          className={`h-full ${concept.masteryPercent >= 80 ? 'bg-teal-600' : concept.masteryPercent >= 50 ? 'bg-amber-600' : 'bg-rose-600'}`}
                          style={{ width: `${concept.masteryPercent}%` }}
                        />}
                      </div>
                      <span className="font-mono text-stone-700">{concept.masteryPercent === null ? 'Not assessed yet' : `${concept.masteryPercent}%`}</span>
                    </div>
                    {concept.lastPracticed && (
                      <span className="text-stone-400">Practiced {concept.lastPracticed}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
};
