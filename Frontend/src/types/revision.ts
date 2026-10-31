/**
 * Revision Queue Domain & Fixture Types
 * Kept strictly isolated from presentation components so it can be directly
 * replaced by the learning engine spaced repetition API when connected.
 */

export type RevisionDueStatus = 'due_now' | 'upcoming' | 'completed';

export interface RevisionRelatedMisconception {
  title: string;
  explanation: string;
  cTrapSnippet?: string;
}

export interface RevisionItem {
  id: string;
  conceptId: string;
  conceptTitle: string;
  questionId: string;
  questionTitle: string;
  category: string;
  dueStatus: RevisionDueStatus;
  dueBadgeText: string;
  scheduleReason: string;
  relatedMisconception?: RevisionRelatedMisconception;
  estimatedMinutes?: number;
  difficulty?: 'Foundational' | 'Intermediate' | 'Advanced';
  retentionDecayPercent?: number; // Provided by demographic/engine fixture, NOT computed in UI
  completedAt?: string;
  isDemoRecord: boolean;
}

export interface RevisionQueueFixture {
  fixtureVersion: string;
  fixtureNotice: string;
  items: RevisionItem[];
}

