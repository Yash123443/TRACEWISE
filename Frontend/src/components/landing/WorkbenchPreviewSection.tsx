import React from 'react';
import { Card, CardHeader, CardBody } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import {
  Layers,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

interface WorkbenchPreviewSectionProps {
  onOpenWorkbench: () => void;
}

export const WorkbenchPreviewSection: React.FC<WorkbenchPreviewSectionProps> = ({
  onOpenWorkbench,
}) => {
  return (
    <section className="py-14 sm:py-20 bg-[#fbfbfa] border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <Badge variant="teal" size="sm">
                Hands-On Trace Verification
              </Badge>
              <span className="text-[11px] font-mono text-stone-600 bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                Simulated Demo Visual
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
              The Interactive Memory Workbench
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Step through physical pointer rewiring in memory before you write a single line of C. Test hypotheses and immediately witness the impact of pointer order on memory reachability.
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={onOpenWorkbench}
            className="text-xs font-semibold shadow-xs"
          >
            Launch Workbench Demo
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </div>

        {/* Workbench Preview Visual Container */}
        <Card className="border-stone-200 bg-white overflow-hidden shadow-xs">
          <CardHeader
            className="bg-stone-50 border-b border-stone-200"
            action={
              <div className="flex items-center gap-2 font-mono text-[11px] text-teal-700">
                <span className="w-2 h-2 rounded-full bg-teal-600"></span>
                <span>Trace: N into A → B → C</span>
              </div>
            }
          >
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-stone-600" />
              <span className="font-semibold text-stone-800 text-xs sm:text-sm">
                Memory Trace Preview • Step 2 of 4: Linking newNode → next
              </span>
            </div>
          </CardHeader>

          <CardBody className="p-5 sm:p-7 space-y-6">
            {/* Labeled Demo Visual: Memory Blocks */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-stone-500 font-mono">
                <span>SIMULATED HEAP MEMORY STATE (0x1000 - 0x10FF)</span>
                <span className="text-stone-700 font-semibold">head = 0x1040 (Node A)</span>
              </div>

              {/* Graphic Representation of Nodes */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-stone-50 border border-stone-200 font-mono text-xs">
                {/* New Node N */}
                <div className="p-3.5 rounded-xl border-2 border-teal-600 bg-teal-50/70 space-y-1.5 relative shadow-xs">
                  <div className="flex items-center justify-between text-[11px] text-teal-800 font-bold">
                    <span>newNode</span>
                    <span>0x1000</span>
                  </div>
                  <div className="text-base font-bold text-teal-950 text-center py-1.5 bg-white rounded-lg border border-teal-200">
                    'N'
                  </div>
                  <div className="text-[11px] text-teal-700 text-center font-bold">
                    next → 0x1040 ('A')
                  </div>
                  <div className="text-[10px] text-teal-800 text-center uppercase tracking-wider font-semibold">
                    Preserves Chain ✓
                  </div>
                </div>

                {/* Node A */}
                <div className="p-3.5 rounded-xl border border-stone-200 bg-white space-y-1.5 shadow-xs">
                  <div className="flex items-center justify-between text-[11px] text-stone-600">
                    <span className="text-amber-700 font-bold">Current head</span>
                    <span>0x1040</span>
                  </div>
                  <div className="text-base font-bold text-stone-900 text-center py-1.5 bg-stone-50 rounded-lg border border-stone-200">
                    'A'
                  </div>
                  <div className="text-[11px] text-stone-600 text-center">
                    next → 0x1080 ('B')
                  </div>
                </div>

                {/* Node B */}
                <div className="p-3.5 rounded-xl border border-stone-200 bg-white space-y-1.5 shadow-xs">
                  <div className="flex items-center justify-between text-[11px] text-stone-600">
                    <span>Node B</span>
                    <span>0x1080</span>
                  </div>
                  <div className="text-base font-bold text-stone-900 text-center py-1.5 bg-stone-50 rounded-lg border border-stone-200">
                    'B'
                  </div>
                  <div className="text-[11px] text-stone-600 text-center">
                    next → 0x10C0 ('C')
                  </div>
                </div>

                {/* Node C */}
                <div className="p-3.5 rounded-xl border border-stone-200 bg-white space-y-1.5 shadow-xs">
                  <div className="flex items-center justify-between text-[11px] text-stone-600">
                    <span>Tail Node</span>
                    <span>0x10C0</span>
                  </div>
                  <div className="text-base font-bold text-stone-900 text-center py-1.5 bg-stone-50 rounded-lg border border-stone-200">
                    'C'
                  </div>
                  <div className="text-[11px] text-rose-600 text-center font-bold">
                    next → NULL
                  </div>
                </div>
              </div>
            </div>

            {/* The Trap vs The Solution Callout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/70 text-amber-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-amber-800">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                  Common Trap: Overwriting head First
                </div>
                <p className="text-xs text-amber-800 leading-relaxed font-mono">
                  head = newNode; // Destroys address 0x1040. Nodes A, B, and C become unreachable orphan memory.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-teal-200 bg-teal-50/70 text-teal-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-teal-800">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-teal-600" />
                  Correct Invariant: Address Conservation
                </div>
                <p className="text-xs text-teal-800 leading-relaxed font-mono">
                  newNode-&gt;next = head; head = newNode; // Conserves address 0x1040 in newNode before modifying head.
                </p>
              </div>
            </div>

            {/* Workbench Controls Preview Bar */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 text-xs">
              <div className="flex items-center gap-2 font-mono text-stone-600">
                <span className="text-stone-500">Controls in Workbench:</span>
                <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-700 text-xs border border-stone-200">Undo</span>
                <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-700 text-xs border border-stone-200">Step Forward</span>
                <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-700 text-xs border border-stone-200">Auto-Play</span>
                <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-700 text-xs border border-stone-200">Rewire Lab</span>
              </div>

              <button
                onClick={onOpenWorkbench}
                className="text-xs text-stone-800 hover:text-stone-900 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                Open Full Interactive Workbench <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
              </button>
            </div>
          </CardBody>
        </Card>
      </div>
    </section>
  );
};
