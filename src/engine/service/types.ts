import type { Attempt, Concept, EvaluationResult, MasteryHistoryEntry, MasteryState, Operation, Question, RevisionTask, StudentMisconception, TeacherAggregate, Trace } from '../contracts/index.js'
import type { ReplayInitialState } from '../simulator/index.js'

export interface ConceptWithMastery { concept: Concept; mastery: MasteryState }
export interface QuestionRecommendation { questionId: string; reason: string; difficulty: Question['difficulty'] }
export interface NextQuestionRecommendation { question: Question; reason: string; difficulty: Question['difficulty'] }
export interface SubmitAnswerInput { learnerId: string; questionId: string; answerText: string; inputMode: 'typed' | 'dictated'; confidence?: number; idempotencyKey: string; now: Date }
export interface SubmitAnswerResult { attempt: Attempt; evaluation: EvaluationResult; trace?: Trace; historyEntry: MasteryHistoryEntry; nextRecommendation: QuestionRecommendation | null; revisionTask: RevisionTask | null }
export interface DiagnosticStatus { total: number; answered: number; complete: boolean; baseline: Array<{ conceptId: string; status: MasteryState['status']; mastery: number | null }> }

export interface TracewiseService {
  /** Return the concept graph with this learner's mastery state for every concept. */
  getConcepts(learnerId: string): Promise<Array<ConceptWithMastery>>
  /** Return the diagnostic question set. */
  getDiagnosticQuestions(): Promise<Question[]>
  /** Return diagnostic completion and the current baseline for diagnostic concepts. */
  getDiagnosticStatus(learnerId: string): Promise<DiagnosticStatus>
  /** Record and evaluate one answer using the supplied timestamp. */
  submitAnswer(input: SubmitAnswerInput): Promise<SubmitAnswerResult>
  /** Select the next question using the supplied timestamp. */
  getNextQuestion(learnerId: string, now: Date): Promise<NextQuestionRecommendation>
  /** Return due and upcoming revision tasks relative to now. */
  getRevisionQueue(learnerId: string, now: Date): Promise<{ due: RevisionTask[]; upcoming: RevisionTask[] }>
  /** Look up one curriculum question. */
  getQuestion(questionId: string): Promise<Question>
  /** Return the learner's misconception records. */
  getMisconceptions(learnerId: string): Promise<StudentMisconception[]>
  /** Return this learner's mastery history. */
  getHistory(learnerId: string): Promise<MasteryHistoryEntry[]>
  /** Return teacher analytics; demo class aggregates must identify as simulated. */
  getTeacherAnalytics(): Promise<TeacherAggregate>
  /** Replay operations through the authoritative simulator; it can be called synchronously or awaited. */
  runReplay(operations: Operation[], initial?: ReplayInitialState): Trace | Promise<Trace>
  /** Reset demo state for a learner. */
  resetDemo(learnerId: string): Promise<void>
  /** Advance the demo clock by a number of days and return its new time. */
  advanceDemoTime(days: number): Promise<Date>
}
