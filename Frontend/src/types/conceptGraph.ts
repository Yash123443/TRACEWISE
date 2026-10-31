/**
 * C Syllabus Concept Graph & Learner Demographic Types
 * Kept completely separated from UI presentation so it can be swapped
 * with real neural-model concept graph endpoints.
 */

export type ConceptStatus = 'not-started' | 'learning' | 'needs-revision' | 'strong';

export type ConceptCategory =
  | 'Memory Foundations'
  | 'Dynamic Heap & Structures'
  | 'Linear Abstract Data Types'
  | 'Non-Linear Hierarchies'
  | 'Algorithmic Operations';

export interface ConceptMisconception {
  id: string;
  title: string;
  explanation: string;
  cCodeIllustration?: string;
}

export interface ConceptNextActivity {
  id: string;
  title: string;
  type: 'trace_reasoning' | 'code_audit' | 'memory_workbench' | 'invariant_drill';
  estimatedMinutes: number;
  prompt: string;
}

export interface ConceptDemoLearnerState {
  status: ConceptStatus;
  statusLabel: string;
  lastPracticed?: string;
  retentionEstimatePercent: number; // Delivered from demographic fixture, NOT computed in UI
  demographicCohortAveragePercent: number;
  isDemoData: true;
}

export interface ConceptNode {
  id: string;
  title: string;
  cSyntaxSignature: string;
  category: ConceptCategory;
  tier: number; // 1 (Foundations) to 5 (Advanced Algorithms)
  summary: string;
  detailedDescription: string;
  prerequisites: string[]; // Node IDs
  dependents: string[];    // Node IDs
  misconceptions: ConceptMisconception[];
  nextActivity: ConceptNextActivity;
  demoLearnerState: ConceptDemoLearnerState;
}

export interface ConceptEdge {
  id: string;
  source: string;
  target: string;
  relationshipLabel: string; // Meaningful prerequisite or supporting rationale
  nature: 'strict_prerequisite' | 'supporting_invariant';
}

export interface CConceptGraphFixture {
  fixtureVersion: string;
  syllabusTitle: string;
  nodes: ConceptNode[];
  edges: ConceptEdge[];
  disclaimerNotice: string;
}

