/**
 * Memory Workbench Trace Contract Types
 * Kept strictly isolated from presentation components so it can be directly
 * replaced by the learning engine simulator output when connected.
 */

export interface MemoryNode {
  id: string;
  val: string;
  memoryAddress: string;
  nextId: string | null;
  status: 'initial' | 'allocated' | 'linked' | 'unreachable' | 'active';
  isHeadTarget?: boolean;
}

export interface MemoryPointerVariable {
  name: string; // e.g. 'head', 'newNode', 'curr'
  targetNodeId: string | null;
  color: string;
}

export interface MemorySnapshot {
  nodes: MemoryNode[];
  pointers: MemoryPointerVariable[];
  headTargetId: string | null;
  unreachableNodeIds: string[];
  hasCycle: boolean;
  cycleNodeId?: string;
  invariantStatus: 'valid' | 'flawed' | 'in-progress';
  invariantNote: string;
}

export interface PredictionOption {
  id: string;
  text: string;
  isCorrect: boolean;
  conceptualExplanation: string;
}

export interface PredictionPrompt {
  id: string;
  question: string;
  promptContext: string;
  options: PredictionOption[];
}

export interface OperationStep {
  stepIndex: number;
  label: string;
  codeInstruction: string;
  description: string;
  targetPointersAffected: string[];
  snapshot: MemorySnapshot;
  prediction?: PredictionPrompt;
}

export interface ConstraintCorrectionScenario {
  id: string;
  name: string;
  description: string;
  codeSnippet: string[];
  headTarget: string | null;
  newNodeNextTarget: string | null;
  resultingSnapshot: MemorySnapshot;
  diagnosticObservation: string;
}

export interface TransferQuestionContract {
  id: string;
  title: string;
  prompt: string;
  targetConcept: string;
  targetInvariants: string[];
  placeholderNotice: string;
}

export interface LinkedListInsertionFixtureTrace {
  fixtureVersion: string;
  fixtureLabel: string;
  problemStatement: {
    title: string;
    description: string;
    initialListRepresentation: string;
    nodeToInsert: { val: string; address: string };
    targetListRepresentation: string;
  };
  steps: OperationStep[];
  constraintCorrectionScenarios: ConstraintCorrectionScenario[];
  transferQuestion: TransferQuestionContract;
}

