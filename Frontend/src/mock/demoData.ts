import type {
  ConceptCategoryProgress,
  DueRevisionItem,
  RecentActivityItem,
  LearningQuestion,
  TeacherCohortMetric,
} from '../types/tracewise';

/**
 * Clearly labeled mock datasets for Tracewise foundational UI.
 * Used when backend API endpoints are disconnected.
 */

export const DEMO_METADATA = {
  isMockData: true,
  datasetName: 'Tracewise Fall 2026 CS-201 & Tech Interview Foundation',
  lastUpdated: '2026-10-31',
  studentProfile: {
    id: 'std_demo_8842',
    name: 'Alex Chen',
    avatarInitials: 'AC',
    targetGoal: 'Midterm DSA Mastery & System Interview Prep',
    overallRetention: 76,
    activeStreakDays: 8,
  },
};

export const DEMO_NEXT_ACTION = {
  questionId: 'q-two-pointers-palindrome',
  title: 'Valid Palindrome II (At most one deletion)',
  category: 'Arrays & Two Pointers',
  difficulty: 'Intermediate' as const,
  estimatedMinutes: 12,
  coreReasoningChallenge:
    'Derive why greedy branch selection on mismatch is sufficient and trace the pointer boundary conditions without extra memory allocation.',
  whyRecommended:
    'You showed uncertainty on 2-pointer branch invariants during Tuesday’s session.',
};

export const DEMO_CONCEPT_PROGRESS: ConceptCategoryProgress[] = [
  {
    category: 'Arrays & Two Pointers',
    color: '#0d9488', // teal
    totalConcepts: 8,
    solidifiedCount: 6,
    averageMastery: 82,
    concepts: [
      {
        id: 'c1',
        name: 'Converging Two-Pointers',
        category: 'Arrays & Two Pointers',
        masteryPercent: 95,
        status: 'solidified',
        lastPracticed: 'Yesterday',
        prerequisites: [],
      },
      {
        id: 'c2',
        name: 'Sliding Window (Dynamic Size)',
        category: 'Arrays & Two Pointers',
        masteryPercent: 78,
        status: 'in-progress',
        lastPracticed: '2 days ago',
        prerequisites: ['c1'],
      },
      {
        id: 'c3',
        name: 'Two Pointers with Branching Decision',
        category: 'Arrays & Two Pointers',
        masteryPercent: 54,
        status: 'needs-review',
        lastPracticed: '3 days ago',
        prerequisites: ['c1'],
      },
      {
        id: 'c4',
        name: 'In-place Array Compaction',
        category: 'Arrays & Two Pointers',
        masteryPercent: 90,
        status: 'solidified',
        lastPracticed: '1 week ago',
        prerequisites: [],
      },
    ],
  },
  {
    category: 'Trees & Binary Search',
    color: '#2563eb', // blue
    totalConcepts: 10,
    solidifiedCount: 5,
    averageMastery: 68,
    concepts: [
      {
        id: 'c5',
        name: 'Rotated Sorted Array Search Invariants',
        category: 'Trees & Binary Search',
        masteryPercent: 88,
        status: 'solidified',
        lastPracticed: 'Yesterday',
        prerequisites: [],
      },
      {
        id: 'c6',
        name: 'Binary Search on Solution Space',
        category: 'Trees & Binary Search',
        masteryPercent: 48,
        status: 'needs-review',
        lastPracticed: '4 days ago',
        prerequisites: ['c5'],
      },
      {
        id: 'c7',
        name: 'BST Lowest Common Ancestor State Tracing',
        category: 'Trees & Binary Search',
        masteryPercent: 72,
        status: 'in-progress',
        lastPracticed: '3 days ago',
        prerequisites: [],
      },
    ],
  },
  {
    category: 'Dynamic Programming',
    color: '#7c3aed', // purple
    totalConcepts: 12,
    solidifiedCount: 3,
    averageMastery: 42,
    concepts: [
      {
        id: 'c8',
        name: '1D State Transitions & Base Cases',
        category: 'Dynamic Programming',
        masteryPercent: 70,
        status: 'in-progress',
        lastPracticed: '5 days ago',
        prerequisites: [],
      },
      {
        id: 'c9',
        name: 'Knapsack Variant Subproblem Overlaps',
        category: 'Dynamic Programming',
        masteryPercent: 35,
        status: 'needs-review',
        lastPracticed: '6 days ago',
        prerequisites: ['c8'],
      },
      {
        id: 'c10',
        name: 'Space Optimization via Rolling Variables',
        category: 'Dynamic Programming',
        masteryPercent: 20,
        status: 'unattempted',
        prerequisites: ['c8'],
      },
    ],
  },
  {
    category: 'Graphs & BFS/DFS',
    color: '#d97706', // amber
    totalConcepts: 9,
    solidifiedCount: 4,
    averageMastery: 61,
    concepts: [
      {
        id: 'c11',
        name: 'Cycle Detection via 3-State Coloring',
        category: 'Graphs & BFS/DFS',
        masteryPercent: 84,
        status: 'solidified',
        lastPracticed: '2 days ago',
        prerequisites: [],
      },
      {
        id: 'c12',
        name: 'Topological Sort (Kahn’s In-Degree Array)',
        category: 'Graphs & BFS/DFS',
        masteryPercent: 52,
        status: 'in-progress',
        lastPracticed: '4 days ago',
        prerequisites: ['c11'],
      },
    ],
  },
];

export const DEMO_DUE_REVISIONS: DueRevisionItem[] = [
  {
    id: 'rev-1',
    conceptId: 'c3',
    title: 'Two Pointers with Branching (Single Deletion)',
    category: 'Arrays & Two Pointers',
    dueLabel: 'Due Today',
    urgency: 'high',
    retentionEstimate: 52,
    daysSinceLastReview: 3,
    lastReasoningFlaw: 'Confused loop index bounds when skipping right vs left mismatched element.',
  },
  {
    id: 'rev-2',
    conceptId: 'c6',
    title: 'Binary Search on Monotonic Answer Range',
    category: 'Trees & Binary Search',
    dueLabel: 'Due Tomorrow',
    urgency: 'medium',
    retentionEstimate: 61,
    daysSinceLastReview: 4,
    lastReasoningFlaw: 'Missed floor vs ceil integer division causing infinite while-loop.',
  },
  {
    id: 'rev-3',
    conceptId: 'c9',
    title: '0/1 Knapsack State Space Boundary Definition',
    category: 'Dynamic Programming',
    dueLabel: 'Due in 2 days',
    urgency: 'low',
    retentionEstimate: 68,
    daysSinceLastReview: 5,
    lastReasoningFlaw: 'Incorrect inner loop iteration direction in 1D array space reduction.',
  },
];

export const DEMO_RECENT_ACTIVITIES: RecentActivityItem[] = [
  {
    id: 'act-1',
    problemId: 'q-two-pointers-palindrome',
    problemTitle: 'Two Sum II - Input Array Is Sorted',
    category: 'Arrays & Two Pointers',
    timestamp: 'Today, 11:20 AM',
    durationMinutes: 14,
    focusType: 'Invariant Trace',
    outcomeLabel: 'Invariant Proven',
    reasoningSnippet:
      'Proved that moving left pointer rightwards never eliminates a potential solution when current sum < target because all right elements are already bounded.',
  },
  {
    id: 'act-2',
    problemId: 'q-cycle-detect',
    problemTitle: 'Course Schedule (Cycle in Directed Graph)',
    category: 'Graphs & BFS/DFS',
    timestamp: 'Yesterday, 4:45 PM',
    durationMinutes: 18,
    focusType: 'Boundary Analysis',
    outcomeLabel: 'Boundary Refined',
    reasoningSnippet:
      'Explicitly distinguished between unvisited (0), visiting in current recursion callstack (1), and fully processed (2).',
  },
  {
    id: 'act-3',
    problemId: 'q-lru-cache',
    problemTitle: 'LRU Cache Invalidation Mechanism',
    category: 'Hash Maps & Heaps',
    timestamp: 'Oct 29, 2:10 PM',
    durationMinutes: 22,
    focusType: 'Complexity Proof',
    outcomeLabel: 'Verified O(1) Guarantee',
    reasoningSnippet:
      'Mapped doubly-linked node eviction with hash map reference deletion to maintain exact constant time guarantees.',
  },
];

export const DEMO_LEARNING_QUESTIONS: LearningQuestion[] = [
  {
    id: 'q-two-pointers-palindrome',
    title: 'Valid Palindrome II (At Most One Character Deletion)',
    category: 'Arrays & Two Pointers',
    difficulty: 'Intermediate',
    examContext: 'Core Technical Interview Pattern / CS201 Midterm Topic',
    statement:
      'Given a string s, return true if the s can be palindrome after deleting at most one character from it.\n\nYour task is not just to output code, but to articulate and trace the invariant: why does a greedy choice on the first mismatch point guarantee correctness without backtracking beyond the immediate skipped character?',
    constraints: [
      '1 <= s.length <= 10^5',
      's consists of lowercase English letters only',
      'Memory budget: O(1) auxiliary space (no string cloning permitted)',
    ],
    examples: [
      {
        input: 's = "aba"',
        output: 'true',
        explanation: 'Already a palindrome without any character deletions.',
      },
      {
        input: 's = "abca"',
        output: 'true',
        explanation: 'You could delete the character \'c\' (or \'b\') to form a palindrome.',
      },
      {
        input: 's = "abc"',
        output: 'false',
        explanation: 'Deleting any single character will not make it a palindrome.',
      },
    ],
    reasoningGoal:
      'Investigate the trace: When s[left] != s[right], examine both sub-branches s[left+1...right] and s[left...right-1]. Formulate the termination condition and prove the O(N) time bound.',
    targetComplexity: {
      time: 'O(N)',
      space: 'O(1) auxiliary space',
    },
    keyInvariantsToAddress: [
      'Why outer pointers can safely advance inward while characters match',
      'Why branching only needs to occur once (at most one deletion permitted)',
      'How the inner helper avoids recursive stack overhead',
    ],
    defaultStarterTrace: `// Trace & Reasoning Scratchpad
1. Pointer Initialization:
   left = 0, right = n - 1

2. Invariant while s[left] == s[right]:
   Both characters match, so no deletion is required for this symmetrical pair.
   Safe to increment left and decrement right.

3. First Mismatch Event (s[left] != s[right]):
   We have exactly 1 deletion allowance remaining.
   Option A: Skip s[left] -> check if s[left+1 ... right] is a strict palindrome.
   Option B: Skip s[right] -> check if s[left ... right-1] is a strict palindrome.

4. Termination & Complexity Derivation:
   Each character is inspected at most twice -> O(N) time.
   No additional strings allocated -> O(1) extra space.`,
  },
  {
    id: 'q-binary-search-rotated',
    title: 'Search in Rotated Sorted Array (Trace Midpoint Invariant)',
    category: 'Trees & Binary Search',
    difficulty: 'Intermediate',
    examContext: 'Midterm Exam - Divide and Conquer Analysis',
    statement:
      'Given an integer array nums sorted in ascending order (with distinct values), and rotated at an unknown pivot index k, determine if target exists in O(log N) time.\n\nFormulate the exact condition that determines whether nums[low...mid] or nums[mid...high] is sorted, and demonstrate why target inclusion is deterministic in that half.',
    constraints: [
      '1 <= nums.length <= 5000',
      '-10^4 <= nums[i] <= 10^4',
      'All values of nums are unique',
      'Time complexity must strictly be O(log N)',
    ],
    examples: [
      {
        input: 'nums = [4,5,6,7,0,1,2], target = 0',
        output: '4',
        explanation: 'Target 0 is found at index 4.',
      },
      {
        input: 'nums = [4,5,6,7,0,1,2], target = 3',
        output: '-1',
        explanation: 'Target 3 does not exist in nums.',
      },
    ],
    reasoningGoal:
      'Articulate the sorted-half guarantee: Even with arbitrary rotation, at least one half (left or right of mid) MUST be normally sorted.',
    targetComplexity: {
      time: 'O(log N)',
      space: 'O(1)',
    },
    keyInvariantsToAddress: [
      'How to verify if left half [low..mid] is strictly monotonically increasing',
      'Boundaries for target check: nums[low] <= target < nums[mid]',
      'Midpoint calculation avoiding integer overflow',
    ],
    defaultStarterTrace: `// Midpoint Partition Invariant:
1. If nums[low] <= nums[mid]:
   Left half is normally sorted.
   If target >= nums[low] and target < nums[mid]:
      high = mid - 1
   Else:
      low = mid + 1

2. Else:
   Right half is normally sorted.
   If target > nums[mid] and target <= nums[high]:
      low = mid + 1
   Else:
      high = mid - 1`,
  },
];

export const DEMO_TEACHER_METRIC: TeacherCohortMetric = {
  totalStudents: 48,
  activeToday: 32,
  averageReasoningScore: 74,
  commonBottlenecks: [
    {
      concept: 'Two Pointers with Branching',
      failureRate: 42,
      commonTrap: 'Assuming both branches can be taken recursively without restricting max deletion count.',
    },
    {
      concept: 'Binary Search Monotonic Boundaries',
      failureRate: 38,
      commonTrap: 'Using <= vs < at while loop condition causing 1-element infinite cycles.',
    },
    {
      concept: 'DP Subproblem Directionality',
      failureRate: 56,
      commonTrap: 'Updating 1D memo array from left-to-right in 0/1 knapsack, accidentally reusing current item.',
    },
  ],
  recentSubmissions: [
    {
      id: 'sub-101',
      studentName: 'Alex Chen',
      problemTitle: 'Valid Palindrome II (At most one deletion)',
      submittedAgo: '12m ago',
      status: 'Pending Review',
    },
    {
      id: 'sub-102',
      studentName: 'Maya Patel',
      problemTitle: 'Search in Rotated Sorted Array',
      submittedAgo: '35m ago',
      status: 'Verified Solid',
    },
    {
      id: 'sub-103',
      studentName: 'Liam Tanaka',
      problemTitle: 'Course Schedule (Cycle in Directed Graph)',
      submittedAgo: '1h ago',
      status: 'Flagged Discrepancy',
    },
    {
      id: 'sub-104',
      studentName: 'Sophia Rodriguez',
      problemTitle: '0/1 Knapsack Space Reduction',
      submittedAgo: '2h ago',
      status: 'Verified Solid',
    },
  ],
};
