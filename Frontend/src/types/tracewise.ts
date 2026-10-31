export type NavigationTab =
  | 'landing'
  | 'overview'
  | 'learn'
  | 'workbench'
  | 'concept-map'
  | 'revision'
  | 'teacher';

export type MasteryStatus = 'solidified' | 'in-progress' | 'needs-review' | 'unattempted';

export interface ConceptItem {
  id: string;
  name: string;
  category: string;
  masteryPercent: number | null; // null until assessed
  status: MasteryStatus;
  lastPracticed?: string;
  prerequisites: string[];
}

export interface ConceptCategoryProgress {
  category: string;
  color: string;
  totalConcepts: number;
  solidifiedCount: number;
  averageMastery: number | null;
  concepts: ConceptItem[];
}

export interface DueRevisionItem {
  id: string;
  conceptId: string;
  title: string;
  category: string;
  dueLabel: string;
  urgency: 'high' | 'medium' | 'low';
  retentionEstimate?: number; // omitted when the engine has no estimate
  daysSinceLastReview?: number;
  lastReasoningFlaw?: string;
}

export interface RecentActivityItem {
  id: string;
  problemId: string;
  problemTitle: string;
  category: string;
  timestamp: string;
  durationMinutes?: number;
  focusType?: 'Invariant Trace' | 'Boundary Analysis' | 'Complexity Proof' | 'Recursive Tree';
  outcomeLabel: string;
  reasoningSnippet: string;
}

export interface ProblemExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface LearningQuestion {
  id: string;
  title: string;
  category: string;
  difficulty: 'Foundational' | 'Intermediate' | 'Advanced';
  examContext: string;
  statement: string;
  constraints: string[];
  examples: ProblemExample[];
  reasoningGoal: string;
  targetComplexity: {
    time: string;
    space: string;
  };
  keyInvariantsToAddress: string[];
  defaultStarterTrace: string;
  options?: string[];
  conceptName?: string;
  recommendationReason?: string;
}

export interface TraceDraft {
  questionId: string;
  rawText: string;
  inputMethod: 'typed' | 'dictated' | 'hybrid';
  lastEdited: string;
}

export interface TraceSubmissionPayload {
  questionId: string;
  studentId: string;
  answerText: string;
  inputMethod: 'typed' | 'dictated' | 'hybrid';
  timeSpentSeconds: number;
  invariantsMentioned: string[];
  submittedAt: string;
}

export interface TeacherCohortMetric {
  totalStudents: number;
  activeToday: number;
  averageReasoningScore: number;
  commonBottlenecks: {
    concept: string;
    failureRate: number;
    commonTrap: string;
  }[];
  recentSubmissions: {
    id: string;
    studentName: string;
    problemTitle: string;
    submittedAgo: string;
    status: 'Pending Review' | 'Flagged Discrepancy' | 'Verified Solid';
  }[];
}

