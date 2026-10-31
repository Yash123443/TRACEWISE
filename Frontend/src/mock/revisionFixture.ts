import type { RevisionQueueFixture } from '../types/revision';

/**
 * Labeled Revision Queue Demo Fixture
 * Separated from presentation code so it can be swapped with the real spaced repetition API.
 */
export const REVISION_QUEUE_FIXTURE: RevisionQueueFixture = {
  fixtureVersion: '1.0.0-revision-demo',
  fixtureNotice:
    'Demo Revision Queue: Review intervals delivered from scheduled demographic fixture. Neural spaced repetition service pending connection.',

  items: [
    {
      id: 'rev-01',
      conceptId: 'linked-lists',
      conceptTitle: 'Linked Lists & Pointer Re-wiring',
      questionId: 'q-two-pointers-palindrome',
      questionTitle: 'Valid Palindrome II (At Most One Deletion)',
      category: 'Arrays & Two Pointers',
      dueStatus: 'due_now',
      dueBadgeText: 'Due Now',
      scheduleReason:
        'Scheduled because your last trace session showed hesitation when branching two pointers on mismatch boundary conditions.',
      relatedMisconception: {
        title: 'Premature Link Overwrite (Orphan Trap)',
        explanation:
          'In pointer-based chains, overwriting a reference before creating the downstream connection severs the link to remaining nodes, creating memory leaks.',
        cTrapSnippet: 'head = newNode;        // Overwrites head prematurely\nnewNode->next = head;  // Self-loop cycle created!',
      },
      estimatedMinutes: 12,
      difficulty: 'Intermediate',
      retentionDecayPercent: 54,
      isDemoRecord: true,
    },
    {
      id: 'rev-02',
      conceptId: 'dynamic-memory',
      conceptTitle: 'Dynamic Memory Allocation (Heap)',
      questionId: 'q-dma-leak-audit',
      questionTitle: 'Detecting Memory Leaks in Multi-Hop Pointer Chains',
      category: 'Dynamic Heap & Structures',
      dueStatus: 'due_now',
      dueBadgeText: 'Due Now',
      scheduleReason:
        'Triggered 3 days after initial drill to reinforce heap ownership invariants and deallocation order before midterms.',
      relatedMisconception: {
        title: 'Dangling Pointer & Use-After-Free',
        explanation:
          'Calling free(ptr) deallocates heap memory but leaves the pointer holding the now-invalid address. It must be zeroed immediately.',
        cTrapSnippet: 'free(ptr);\n// Missing: ptr = NULL;\nprintf("%d", *ptr); // Undefined memory corruption!',
      },
      estimatedMinutes: 15,
      difficulty: 'Intermediate',
      retentionDecayPercent: 58,
      isDemoRecord: true,
    },
    {
      id: 'rev-03',
      conceptId: 'trees',
      conceptTitle: 'Trees & Binary Search Trees (BST)',
      questionId: 'q-binary-search-rotated',
      questionTitle: 'Search in Rotated Sorted Array (Trace Midpoint Invariant)',
      category: 'Trees & Binary Search',
      dueStatus: 'due_now',
      dueBadgeText: 'Due Now',
      scheduleReason:
        'Scheduled because learner took multiple attempts to identify the sorted-half guarantee during divide-and-conquer partitions.',
      relatedMisconception: {
        title: 'Local BST Check Trap',
        explanation:
          'Verifying only immediate parent-child node order (left < root < right) fails to guarantee the global BST invariant across ancestors.',
      },
      estimatedMinutes: 14,
      difficulty: 'Intermediate',
      retentionDecayPercent: 62,
      isDemoRecord: true,
    },
    {
      id: 'rev-04',
      conceptId: 'stacks',
      conceptTitle: 'Stacks (LIFO Abstract Data Type)',
      questionId: 'q-stack-brackets',
      questionTitle: 'Bracket Matching & Callstack Invariant Verification',
      category: 'Linear Abstract Data Types',
      dueStatus: 'upcoming',
      dueBadgeText: 'Upcoming in 2 Days',
      scheduleReason:
        'Spaced decay schedule projected in 48 hours to sustain retention above the 80% threshold.',
      relatedMisconception: {
        title: 'Popping on Stack Underflow',
        explanation:
          'Attempting to pop from an empty stack (top == -1) causes negative index access in C array-backed stacks or null dereference in linked stacks.',
        cTrapSnippet: 'if (top == -1) {\n  // Must guard against underflow before pop\n}',
      },
      estimatedMinutes: 10,
      difficulty: 'Foundational',
      retentionDecayPercent: 78,
      isDemoRecord: true,
    },
    {
      id: 'rev-05',
      conceptId: 'queues',
      conceptTitle: 'Queues & Circular Modulo Buffers',
      questionId: 'q-circular-queue',
      questionTitle: 'Circular Queue Wrap-Around & Capacity Boundaries',
      category: 'Linear Abstract Data Types',
      dueStatus: 'upcoming',
      dueBadgeText: 'Upcoming in 4 Days',
      scheduleReason:
        'Scheduled review to verify modulo index arithmetic after initial circular buffer exercise.',
      relatedMisconception: {
        title: 'Linear Queue False Overflow',
        explanation:
          'When rear reaches capacity - 1, a naive linear queue rejects enqueues even if front has advanced, wasting available array memory.',
      },
      estimatedMinutes: 12,
      difficulty: 'Intermediate',
      retentionDecayPercent: 82,
      isDemoRecord: true,
    },
    {
      id: 'rev-06',
      conceptId: 'array',
      conceptTitle: 'Arrays & Contiguous Buffers',
      questionId: 'q-two-sum-sorted',
      questionTitle: 'Two Sum II - Converging Two-Pointer Boundaries',
      category: 'Memory Foundations',
      dueStatus: 'completed',
      dueBadgeText: 'Completed Today',
      scheduleReason:
        'Spaced verification completed during morning study session. Boundary proof confirmed.',
      estimatedMinutes: 8,
      difficulty: 'Foundational',
      retentionDecayPercent: 95,
      completedAt: 'Today at 10:45 AM',
      isDemoRecord: true,
    },
  ],
};

