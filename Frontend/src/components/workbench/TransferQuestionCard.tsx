import React, { useState } from 'react';
import type { TransferQuestionContract } from '../../types/workbenchTrace';
import { Card, CardHeader, CardBody } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Send, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

interface TransferQuestionCardProps {
  contract: TransferQuestionContract;
}

export const TransferQuestionCard: React.FC<TransferQuestionCardProps> = ({ contract }) => {
  const [responseDraft, setResponseDraft] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!responseDraft.trim()) return;
    setSubmitted(true);
  };

  return (
    <Card className="border-stone-200 bg-white shadow-xs">
      <CardHeader
        className="bg-stone-50/70 border-b border-stone-200"
        action={
          <Badge variant="blue" size="sm">
            Phase 3: Transfer Invariant
          </Badge>
        }
      >
        <div className="flex items-center gap-2">
          <ArrowRight className="w-4 h-4 text-stone-700" />
          <h3 className="font-semibold text-stone-900 text-sm">
            {contract.title}
          </h3>
        </div>
      </CardHeader>

      <CardBody className="p-4 sm:p-5 space-y-4">
        <div className="text-xs sm:text-sm text-stone-800 leading-relaxed whitespace-pre-line bg-stone-50/70 p-3.5 rounded-lg border border-stone-200">
          {contract.prompt}
        </div>

        {/* Target Invariants to transfer */}
        <div>
          <span className="text-xs font-semibold text-stone-800 uppercase tracking-wider block mb-1.5">
            Key Invariants to Formulate:
          </span>
          <ul className="space-y-1 text-xs text-stone-600">
            {contract.targetInvariants.map((inv, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-stone-500 mt-1.5 shrink-0" />
                <span>{inv}</span>
              </li>
            ))}
          </ul>
        </div>

        {submitted ? (
          <div className="p-4 bg-teal-50 border border-teal-200 rounded-lg space-y-2 text-xs text-teal-950 animate-in fade-in">
            <div className="flex items-center gap-2 font-semibold text-teal-900">
              <CheckCircle2 className="w-4 h-4 text-teal-700" />
              <span>Transfer Invariant Hypothesis Recorded</span>
            </div>
            <p className="leading-relaxed">
              Your articulated transfer reasoning has been staged in local memory ready for simulator ingest.
            </p>
            <div className="p-2.5 bg-white rounded-md border border-teal-200 font-mono text-[11px] text-stone-800">
              "{responseDraft}"
            </div>
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="text-teal-800 underline hover:text-teal-900 font-medium pt-1 cursor-pointer"
            >
              Amend Transfer Reasoning
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <label htmlFor="transfer-response" className="sr-only">
              Formulate your transfer invariant reasoning
            </label>
            <textarea
              id="transfer-response"
              rows={3}
              value={responseDraft}
              onChange={(e) => setResponseDraft(e.target.value)}
              placeholder="Explain how you would adapt the pointer ordering when inserting at the tail or when the list might be empty..."
              className="w-full p-3 text-xs sm:text-sm font-mono text-stone-900 bg-stone-50/50 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:bg-white resize-y leading-relaxed"
            />

            <div className="flex items-center justify-between">
              <span className="text-[11px] text-stone-500 font-mono">
                {responseDraft.length} characters
              </span>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={!responseDraft.trim()}
                rightIcon={<Send className="w-3.5 h-3.5" />}
              >
                Record Transfer Hypothesis
              </Button>
            </div>
          </form>
        )}

        {/* Contract Notice */}
        <div className="flex items-center gap-2 text-[11px] text-stone-500 pt-2 border-t border-stone-200">
          <ShieldCheck className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          <span>{contract.placeholderNotice}</span>
        </div>
      </CardBody>
    </Card>
  );
};
