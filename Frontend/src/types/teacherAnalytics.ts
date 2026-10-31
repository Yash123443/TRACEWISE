// Data contracts for Teacher Insights & Class Cohort Analytics
// Pure interfaces separated from UI presentation

export type MasteryTier = 'solidified' | 'developing' | 'critical_gap';

export type GapUrgency = 'critical' | 'moderate' | 'elevated';

export type MisconceptionSeverity = 'high' | 'medium' | 'low';

export interface CohortMetadata {
  cohortId: string;
  courseCode: string;
  courseTitle: string;
  semester: string;
  studentsRepresented: number;
  datasetLabel: string;
  datasetDisclaimer: string;
  lastSynthesized: string;
  evaluationScope: string;
}

export interface ConceptMasteryDistribution {
  solidifiedStudents: number;
  developingStudents: number;
  criticalGapStudents: number;
}

export interface ConceptMasteryAggregate {
  conceptId: string;
  conceptName: string;
  category: string;
  classMasteryPercent: number; // 0 - 100
  benchmarkTargetPercent: number; // e.g. 85
  gapPercent: number; // target - classMastery
  masteryTier: MasteryTier;
  masteryTierLabel: string;
  distribution: ConceptMasteryDistribution;
  supportingDetail: {
    description: string;
    primaryFailurePoint: string;
    representativeAssessmentTask: string;
    sampleErrorSnippet: string;
    affectedSubtopics: string[];
    recommendedExerciseName: string;
  };
}

export interface LearningGapItem {
  rank: number;
  conceptId: string;
  conceptName: string;
  category: string;
  classAveragePercent: number;
  benchmarkPercent: number;
  gapPercent: number;
  urgency: GapUrgency;
  urgencyLabel: string;
  affectedStudentCount: number;
  totalStudents: number;
  coreObstacle: string;
}

export interface MisconceptionPattern {
  id: string;
  conceptId: string;
  conceptName: string;
  patternTitle: string;
  studentCount: number;
  totalCohort: number;
  prevalencePercent: number;
  totalOccurrences: number;
  severity: MisconceptionSeverity;
  severityLabel: string;
  cCodeTrapSnippet: string;
  invariantViolation: string;
  diagnosticSocraticPrompt: string;
  suggestedActionLabel: string;
  targetStudioQuestionId?: string;
}

export interface SupportThresholdConfig {
  thresholdDescription: string;
  masteryCutoffPercent: number;
  misconceptionsCutoffCount: number;
  studentsBelowThresholdCount: number;
  totalStudents: number;
}

export interface StudentNeedingSupport {
  studentId: string;
  displayIdentifier: string;
  isSimulated: boolean;
  masteryPercent: number;
  primaryStruggleConcept: string;
  flaggedMisconceptions: string[];
  flaggedCount: number;
  urgencyLevel: 'immediate' | 'monitor';
  recommendedIntervention: string;
  suggestedAction: 'review_workbench' | 'assign_practice';
  targetStudioQuestionId: string;
}

export interface ReteachActionStep {
  stepNumber: number;
  stepTitle: string;
  durationMinutes: number;
  instruction: string;
  cCodeExample?: string;
}

export interface ReteachSuggestion {
  targetGapConceptId: string;
  targetGapConceptName: string;
  gapMagnitudeText: string;
  title: string;
  durationEstimate: string;
  pedagogicalRationale: string;
  suggestedFormat: string;
  actionSteps: ReteachActionStep[];
  workbenchExerciseTitle: string;
  studioQuestionId: string;
}

export interface TeacherAnalyticsData {
  metadata: CohortMetadata;
  supportThreshold: SupportThresholdConfig;
  conceptsMastery: ConceptMasteryAggregate[];
  topLearningGaps: LearningGapItem[];
  commonMisconceptions: MisconceptionPattern[];
  studentsNeedingSupport: StudentNeedingSupport[];
  reteachSuggestion: ReteachSuggestion;
}

