import type { Attempt, Concept, EvaluationResult, MasteryHistoryEntry, MasteryState, Operation, Question, RevisionTask, TeacherAggregate, Trace } from '../contracts/index.js'

export interface ConceptWithMastery { concept: Concept; mastery: MasteryState }
export interface QuestionRecommendation { questionId: string; reason: string; difficulty: Question['difficulty'] }
export interface NextQuestionRecommendation { question: Question; reason: string; difficulty: Question['difficulty'] }
export interface SubmitAnswerInput { learnerId: string; questionId: string; answerText: string; inputMode: 'typed' | 'dictated'; confidence?: number; idempotencyKey: string; now: Date }
export interface SubmitAnswerResult { attempt: Attempt; evaluation: EvaluationResult; trace?: Trace; historyEntry: MasteryHistoryEntry; nextRecommendation: QuestionRecommendation; revisionTask: RevisionTask }

export interface TracewiseService {
  /** Return the concept graph with this learner's mastery state for every concept. */
  getConcepts(learnerId: string): Promise<Array<ConceptWithMastery>>
  /** Return the diagnostic question set. */
  getDiagnosticQuestions(): Promise<Question[]>
  /** Record and evaluate one answer using the supplied timestamp. */
  submitAnswer(input: SubmitAnswerInput): Promise<SubmitAnswerResult>
  /** Select the next question using the supplied timestamp. */
  getNextQuestion(learnerId: string, now: Date): Promise<NextQuestionRecommendation>
  /** Return due and upcoming revision tasks relative to now. */
  getRevisionQueue(learnerId: string, now: Date): Promise<{ due: RevisionTask[]; upcoming: RevisionTask[]; completed: RevisionTask[] }>
  /** Mark a scheduled revision done and persist the completion. */
  completeRevision(learnerId: string, revisionId: string, now: Date): Promise<RevisionTask>
  /** Reopen a previously completed revision task. */
  reopenRevision(learnerId: string, revisionId: string): Promise<RevisionTask>
  /** Return this learner's mastery history. */
  getHistory(learnerId: string): Promise<MasteryHistoryEntry[]>
  /** Return recorded attempts so the UI can show the learner's own submitted evidence. */
  getAttempts(learnerId: string): Promise<Attempt[]>
  /** Return teacher analytics; demo class aggregates must identify as simulated. */
  getTeacherAnalytics(): Promise<TeacherAggregate>
  /** Replay operations through the authoritative simulator; it can be called synchronously or awaited. */
  runReplay(operations: Operation[]): Trace | Promise<Trace>
  /** Reset demo state for a learner. */
  resetDemo(learnerId: string): Promise<void>
  /** Advance the demo clock by a number of days and return its new time. */
  advanceDemoTime(days: number, now: Date): Promise<Date>
}
