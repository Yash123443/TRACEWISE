import type { TeacherAnalyticsData } from '../types/teacherAnalytics';

/**
 * Separated fixture dataset for the Teacher Insights & Cohort Diagnostics screen.
 * All class-level aggregates, distributions, gaps, and threshold groups are pre-calculated
 * here rather than in presentation components, ensuring seamless drop-in replacement by the real
 * teacher analytics API when available.
 */
export const TEACHER_ANALYTICS_FIXTURE: TeacherAnalyticsData = {
  metadata: {
    cohortId: 'CS201-FALL2026',
    courseCode: 'CS201',
    courseTitle: 'Data Structures & Program Design in C',
    semester: 'Fall 2026',
    studentsRepresented: 48,
    datasetLabel: 'Simulated Demo Data',
    datasetDisclaimer:
      'Notice: All cohort statistics, student traces, and counts shown below are synthetic demo fixtures for educator preview. No live student activity or real telemetry is monitored.',
    lastSynthesized: '2026-10-31T08:00:00Z',
    evaluationScope: 'Diagnostic Midterm Checkpoint: Pointer & Memory Invariants',
  },

  supportThreshold: {
    thresholdDescription:
      'Demo Support Flag: Overall Invariant Mastery < 60% OR ≥ 2 Flagged Misconceptions in Diagnostic Queue',
    masteryCutoffPercent: 60,
    misconceptionsCutoffCount: 2,
    studentsBelowThresholdCount: 8,
    totalStudents: 48,
  },

  conceptsMastery: [
    {
      conceptId: 'dynamic-memory',
      conceptName: 'Dynamic Memory Allocation',
      category: 'Memory & Lifecycle',
      classMasteryPercent: 52,
      benchmarkTargetPercent: 85,
      gapPercent: 33,
      masteryTier: 'critical_gap',
      masteryTierLabel: 'Critical Gap (52%)',
      distribution: {
        solidifiedStudents: 11,
        developingStudents: 16,
        criticalGapStudents: 21,
      },
      supportingDetail: {
        description:
          'Managing runtime heap allocations with malloc, calloc, realloc, and ensuring rigorous free() deallocation invariants without memory leaks or dangling pointers.',
        primaryFailurePoint:
          'Overwriting pointer references before calling free(), leaving unreferenced allocated memory blocks permanently leaked on the heap.',
        representativeAssessmentTask:
          'Implement free_linked_list() without accessing freed nodes or leaking memory.',
        sampleErrorSnippet:
          'void freeList(Node* head) {\n  while (head != NULL) {\n    free(head);\n    head = head->next; // CRITICAL: Use-after-free violation!\n  }\n}',
        affectedSubtopics: ['Heap vs Stack Lifetime', 'Safe Deallocation Sequencing', 'malloc NULL Checking'],
        recommendedExerciseName: 'Linked List Safe Deallocation Trace',
      },
    },
    {
      conceptId: 'pointers',
      conceptName: 'Pointer Invariants & Arithmetic',
      category: 'Memory & Lifecycle',
      classMasteryPercent: 56,
      benchmarkTargetPercent: 85,
      gapPercent: 29,
      masteryTier: 'critical_gap',
      masteryTierLabel: 'Critical Gap (56%)',
      distribution: {
        solidifiedStudents: 13,
        developingStudents: 18,
        criticalGapStudents: 17,
      },
      supportingDetail: {
        description:
          'Memory address referencing (&), dereferencing (*), double pointers for head mutation, and distinguishing pointer address reassignment from value modification.',
        primaryFailurePoint:
          'Conflating the memory address of the pointer with the dereferenced struct contents, or missing pass-by-reference (Node**) when updating list headers.',
        representativeAssessmentTask:
          'Modify a linked list head pointer inside a void helper function.',
        sampleErrorSnippet:
          'void insertHead(Node* head, int val) {\n  Node* n = malloc(sizeof(Node));\n  n->data = val; n->next = head;\n  head = n; // Pass-by-value: caller head remains unchanged!\n}',
        affectedSubtopics: ['Double Pointers (Node**)', 'L-value vs R-value semantics', 'NULL guards'],
        recommendedExerciseName: 'Double Pointer Header Mutation Proof',
      },
    },
    {
      conceptId: 'linked-lists',
      conceptName: 'Linked List Operations',
      category: 'Linear Structures',
      classMasteryPercent: 61,
      benchmarkTargetPercent: 85,
      gapPercent: 24,
      masteryTier: 'critical_gap',
      masteryTierLabel: 'Critical Gap (61%)',
      distribution: {
        solidifiedStudents: 15,
        developingStudents: 19,
        criticalGapStudents: 14,
      },
      supportingDetail: {
        description:
          'Sequential node chaining, head/tail insertion and deletion invariants, cycle detection, and maintaining pointer reachability during restructuring.',
        primaryFailurePoint:
          'Pre-maturely overwriting head pointer without saving existing chain pointer, creating immediate cyclic self-references or dropping list tails.',
        representativeAssessmentTask:
          'Insert new node N before current head in list A -> B -> C without data loss.',
        sampleErrorSnippet:
          'head = newNode;\nnewNode->next = head; // Head now points to newNode, so newNode->next points to itself!',
        affectedSubtopics: ['Head Insertion Invariant', 'Two-pointer Tortoise/Hare', 'Sentinel Dummy Nodes'],
        recommendedExerciseName: 'Insert Node at Beginning of A -> B -> C',
      },
    },
    {
      conceptId: 'trees',
      conceptName: 'Binary Trees & Traversals',
      category: 'Hierarchical Structures',
      classMasteryPercent: 67,
      benchmarkTargetPercent: 85,
      gapPercent: 18,
      masteryTier: 'developing',
      masteryTierLabel: 'Developing (67%)',
      distribution: {
        solidifiedStudents: 18,
        developingStudents: 20,
        criticalGapStudents: 10,
      },
      supportingDetail: {
        description:
          'Recursive tree traversal (pre-order, in-order, post-order), BST search and insertion invariants, and tree height / balance calculations.',
        primaryFailurePoint:
          'Missing the base case return invariant for NULL leaves or losing subtree linkage when returning modified subtrees from recursive calls.',
        representativeAssessmentTask:
          'Calculate the maximum depth of a binary tree using recursive induction.',
        sampleErrorSnippet:
          'int depth(Node* r) {\n  // Missing if (r == NULL) return 0;\n  return 1 + max(depth(r->left), depth(r->right));\n}',
        affectedSubtopics: ['Recursive Base Invariant', 'BST Property Verification', 'Post-Order Memory Cleanup'],
        recommendedExerciseName: 'BST Invariant Verification & Deletion',
      },
    },
    {
      conceptId: 'stacks-queues',
      conceptName: 'Stacks & Queues',
      category: 'Linear Structures',
      classMasteryPercent: 76,
      benchmarkTargetPercent: 85,
      gapPercent: 9,
      masteryTier: 'developing',
      masteryTierLabel: 'Developing (76%)',
      distribution: {
        solidifiedStudents: 26,
        developingStudents: 16,
        criticalGapStudents: 6,
      },
      supportingDetail: {
        description:
          'LIFO and FIFO discipline implemented with dynamic arrays or linked nodes, overflow/underflow invariants, and monotonic stack patterns.',
        primaryFailurePoint:
          'Failing to verify underflow bounds prior to reading the stack top or dequeueing from an empty circular buffer.',
        representativeAssessmentTask:
          'Implement circular queue enqueue and dequeue with modulo array index wraps.',
        sampleErrorSnippet:
          'int pop(Stack* s) {\n  // Missing if (s->top == -1) error guard\n  return s->data[s->top--];\n}',
        affectedSubtopics: ['Circular Buffer Wrapping', 'Monotonic Stack Proofs', 'Array vs Linked Backing'],
        recommendedExerciseName: 'Circular Queue Wrap-Around Invariant',
      },
    },
    {
      conceptId: 'arrays-strings',
      conceptName: 'Arrays & Boundary Invariants',
      category: 'Foundational Structures',
      classMasteryPercent: 88,
      benchmarkTargetPercent: 85,
      gapPercent: 0,
      masteryTier: 'solidified',
      masteryTierLabel: 'Solidified (88%)',
      distribution: {
        solidifiedStudents: 36,
        developingStudents: 9,
        criticalGapStudents: 3,
      },
      supportingDetail: {
        description:
          'Contiguous block indexing, pointer arithmetic offsets, two-pointer window invariants, and string sentinel null-terminator (\\0) invariants.',
        primaryFailurePoint:
          'Off-by-one errors when terminating loops with n vs n - 1 or forgetting the null byte storage overhead in malloc(len + 1).',
        representativeAssessmentTask:
          'Implement two-pointer in-place palindrome verification with non-alphanumeric skips.',
        sampleErrorSnippet:
          'char* copy = malloc(strlen(src)); // Missing + 1 for null terminator "\\0"',
        affectedSubtopics: ['Off-by-one Loop Bounds', 'Null Byte Sentinel', 'Two-pointer Squeeze'],
        recommendedExerciseName: 'Valid Palindrome II with Single Deletion',
      },
    },
  ],

  topLearningGaps: [
    {
      rank: 1,
      conceptId: 'dynamic-memory',
      conceptName: 'Dynamic Memory Allocation',
      category: 'Memory & Lifecycle',
      classAveragePercent: 52,
      benchmarkPercent: 85,
      gapPercent: 33,
      urgency: 'critical',
      urgencyLabel: 'Top Class Gap',
      affectedStudentCount: 21,
      totalStudents: 48,
      coreObstacle:
        'Losing reference pointers prior to free(), or dereferencing heap pointers after deallocation (use-after-free).',
    },
    {
      rank: 2,
      conceptId: 'pointers',
      conceptName: 'Pointer Invariants & Arithmetic',
      category: 'Memory & Lifecycle',
      classAveragePercent: 56,
      benchmarkPercent: 85,
      gapPercent: 29,
      urgency: 'critical',
      urgencyLabel: 'Critical Bottleneck',
      affectedStudentCount: 17,
      totalStudents: 48,
      coreObstacle:
        'Pass-by-value misunderstandings when updating head pointers; confusing pointer address with dereferenced value.',
    },
    {
      rank: 3,
      conceptId: 'linked-lists',
      conceptName: 'Linked List Operations',
      category: 'Linear Structures',
      classAveragePercent: 61,
      benchmarkPercent: 85,
      gapPercent: 24,
      urgency: 'elevated',
      urgencyLabel: 'Elevated Gap',
      affectedStudentCount: 14,
      totalStudents: 48,
      coreObstacle:
        'Overwriting head pointer prior to establishing the new node’s next link, causing data detachment or loops.',
    },
  ],

  commonMisconceptions: [
    {
      id: 'misc-head-overwrite',
      conceptId: 'linked-lists',
      conceptName: 'Linked Lists',
      patternTitle: 'Head Overwrite Before Next Pointer Binding',
      studentCount: 23,
      totalCohort: 48,
      prevalencePercent: 48,
      totalOccurrences: 39,
      severity: 'high',
      severityLabel: 'High Prevalence',
      cCodeTrapSnippet:
        '// Common Flawed Student Code:\nhead = newNode;\nnewNode->next = head; // Overwrites head first, creating an immediate self-cycle!',
      invariantViolation:
        'Overwriting head first replaces the only reference holding the rest of the list (0x1040). newNode->next then points back to newNode, isolating nodes B and C forever.',
      diagnosticSocraticPrompt:
        'If you overwrite `head` on line 1, which variable in memory still stores the address of node A? Where will that address be saved?',
      suggestedActionLabel: 'Demonstrate with Memory Workbench',
      targetStudioQuestionId: 'q-ll-head-insert',
    },
    {
      id: 'misc-use-after-free',
      conceptId: 'dynamic-memory',
      conceptName: 'Dynamic Memory',
      patternTitle: 'Use-After-Free Dereference in Cleanup Loop',
      studentCount: 19,
      totalCohort: 48,
      prevalencePercent: 40,
      totalOccurrences: 31,
      severity: 'high',
      severityLabel: 'High Prevalence',
      cCodeTrapSnippet:
        '// Common Flawed Student Code:\nwhile (curr != NULL) {\n  free(curr);\n  curr = curr->next; // Reading memory that was just relinquished to OS runtime!\n}',
      invariantViolation:
        'Calling free(curr) invalidates the heap chunk immediately. Reading curr->next afterwards triggers undefined behavior and segmentation traps in production.',
      diagnosticSocraticPrompt:
        'Does free(curr) erase the memory immediately, or does it return ownership? Can you read curr->next after returning ownership?',
      suggestedActionLabel: 'Review Safe Traversal Temp Variable Pattern',
      targetStudioQuestionId: 'q-ll-free-traverse',
    },
    {
      id: 'misc-null-short-circuit',
      conceptId: 'pointers',
      conceptName: 'Pointers',
      patternTitle: 'Inverted NULL Guard Condition in Loop Check',
      studentCount: 16,
      totalCohort: 48,
      prevalencePercent: 33,
      totalOccurrences: 24,
      severity: 'medium',
      severityLabel: 'Moderate Prevalence',
      cCodeTrapSnippet:
        '// Common Flawed Student Code:\nwhile (curr->next != NULL && curr != NULL) {\n  curr = curr->next;\n}',
      invariantViolation:
        'Logical short-circuit evaluation order error. When curr is NULL, evaluating curr->next first triggers a SIGSEGV before reaching the curr != NULL guard.',
      diagnosticSocraticPrompt:
        'In C, in what order does the && operator evaluate expressions? If curr is NULL, which side must be checked first?',
      suggestedActionLabel: 'Practice Short-Circuit Guard Ordering',
      targetStudioQuestionId: 'q-ptr-null-order',
    },
    {
      id: 'misc-tree-null-return',
      conceptId: 'trees',
      conceptName: 'Trees',
      patternTitle: 'Missing Base Case NULL Return in Recursive Invariants',
      studentCount: 12,
      totalCohort: 48,
      prevalencePercent: 25,
      totalOccurrences: 17,
      severity: 'medium',
      severityLabel: 'Moderate Prevalence',
      cCodeTrapSnippet:
        '// Common Flawed Student Code:\nint maxDepth(TreeNode* root) {\n  // Missing: if (!root) return 0;\n  return 1 + max(maxDepth(root->left), maxDepth(root->right));\n}',
      invariantViolation:
        'Omitting the inductive base case causes recursive traversal to dereference null leaf pointers, resulting in stack overflow.',
      diagnosticSocraticPrompt:
        'What is the maximum depth of an empty tree with zero nodes? Where does your function handle that case?',
      suggestedActionLabel: 'Inspect Recursive Tree Frame Depths',
      targetStudioQuestionId: 'q-tree-max-depth',
    },
  ],

  studentsNeedingSupport: [
    {
      studentId: 'sim-std-104',
      displayIdentifier: 'Simulated Learner #104',
      isSimulated: true,
      masteryPercent: 44,
      primaryStruggleConcept: 'Dynamic Memory Allocation',
      flaggedMisconceptions: [
        'Head Overwrite Before Next Pointer Binding',
        'Use-After-Free Dereference in Cleanup Loop',
      ],
      flaggedCount: 2,
      urgencyLevel: 'immediate',
      recommendedIntervention: 'Conduct 1-on-1 walkthrough of head insertion in Memory Workbench',
      suggestedAction: 'review_workbench',
      targetStudioQuestionId: 'q-ll-head-insert',
    },
    {
      studentId: 'sim-std-112',
      displayIdentifier: 'Simulated Learner #112',
      isSimulated: true,
      masteryPercent: 48,
      primaryStruggleConcept: 'Pointer Invariants & Arithmetic',
      flaggedMisconceptions: [
        'Head Overwrite Before Next Pointer Binding',
        'Inverted NULL Guard Condition in Loop Check',
      ],
      flaggedCount: 2,
      urgencyLevel: 'immediate',
      recommendedIntervention: 'Assign double-pointer parameter mutation diagnostic',
      suggestedAction: 'assign_practice',
      targetStudioQuestionId: 'q-ptr-double-param',
    },
    {
      studentId: 'sim-std-119',
      displayIdentifier: 'Simulated Learner #119',
      isSimulated: true,
      masteryPercent: 51,
      primaryStruggleConcept: 'Dynamic Memory Allocation',
      flaggedMisconceptions: ['Use-After-Free Dereference in Cleanup Loop'],
      flaggedCount: 1,
      urgencyLevel: 'immediate',
      recommendedIntervention: 'Review stack vs heap deallocation sequencing in workbench',
      suggestedAction: 'review_workbench',
      targetStudioQuestionId: 'q-ll-free-traverse',
    },
    {
      studentId: 'sim-std-125',
      displayIdentifier: 'Simulated Learner #125',
      isSimulated: true,
      masteryPercent: 53,
      primaryStruggleConcept: 'Linked List Operations',
      flaggedMisconceptions: ['Head Overwrite Before Next Pointer Binding'],
      flaggedCount: 1,
      urgencyLevel: 'immediate',
      recommendedIntervention: 'Require constraint correction lab on head insertion',
      suggestedAction: 'review_workbench',
      targetStudioQuestionId: 'q-ll-head-insert',
    },
    {
      studentId: 'sim-std-131',
      displayIdentifier: 'Simulated Learner #131',
      isSimulated: true,
      masteryPercent: 55,
      primaryStruggleConcept: 'Binary Trees & Traversals',
      flaggedMisconceptions: ['Missing Base Case NULL Return in Recursive Invariants'],
      flaggedCount: 1,
      urgencyLevel: 'monitor',
      recommendedIntervention: 'Assign inductive base case derivation in Learning Studio',
      suggestedAction: 'assign_practice',
      targetStudioQuestionId: 'q-tree-max-depth',
    },
    {
      studentId: 'sim-std-138',
      displayIdentifier: 'Simulated Learner #138',
      isSimulated: true,
      masteryPercent: 57,
      primaryStruggleConcept: 'Pointer Invariants & Arithmetic',
      flaggedMisconceptions: ['Inverted NULL Guard Condition in Loop Check'],
      flaggedCount: 1,
      urgencyLevel: 'monitor',
      recommendedIntervention: 'Review C logical operator short-circuit evaluation order',
      suggestedAction: 'assign_practice',
      targetStudioQuestionId: 'q-ptr-null-order',
    },
    {
      studentId: 'sim-std-142',
      displayIdentifier: 'Simulated Learner #142',
      isSimulated: true,
      masteryPercent: 58,
      primaryStruggleConcept: 'Dynamic Memory Allocation',
      flaggedMisconceptions: ['Use-After-Free Dereference in Cleanup Loop'],
      flaggedCount: 1,
      urgencyLevel: 'monitor',
      recommendedIntervention: 'Provide temp-pointer deallocation recipe and verification task',
      suggestedAction: 'review_workbench',
      targetStudioQuestionId: 'q-ll-free-traverse',
    },
    {
      studentId: 'sim-std-147',
      displayIdentifier: 'Simulated Learner #147',
      isSimulated: true,
      masteryPercent: 59,
      primaryStruggleConcept: 'Linked List Operations',
      flaggedMisconceptions: ['Head Overwrite Before Next Pointer Binding'],
      flaggedCount: 1,
      urgencyLevel: 'monitor',
      recommendedIntervention: 'Prompt student to identify orphan nodes using 2D memory visualizer',
      suggestedAction: 'review_workbench',
      targetStudioQuestionId: 'q-ll-head-insert',
    },
  ],

  reteachSuggestion: {
    targetGapConceptId: 'dynamic-memory',
    targetGapConceptName: 'Dynamic Memory & Pointer Re-linking Invariants',
    gapMagnitudeText: 'Top Class Gap: 33% Below Cohort Benchmark (52% Mastery vs 85% Target)',
    title: '15-Minute Visual Proof: Pointer Preservation Order Before Overwrite',
    durationEstimate: '15-Minute Micro-Lecture & Workbench Walkthrough',
    pedagogicalRationale:
      'Over 48% of the cohort loses reference addresses by overwriting the head pointer prior to establishing secondary linkages. An explicit address trace in the 2D memory workbench proves why saving the address in newNode->next is a strict precondition before modifying head.',
    suggestedFormat: 'Live Interactive Trace Walkthrough & Micro-Quiz',
    actionSteps: [
      {
        stepNumber: 1,
        stepTitle: 'Step 1: Visual Address Conservation (4 min)',
        durationMinutes: 4,
        instruction:
          'Project the 2D Memory Workbench with list A -> B -> C. Point to the head variable and ask students: "What numeric value is stored inside head?" (Answer: Address 0x1040). Emphasize that head is merely an 8-byte container.',
        cCodeExample: '// State in memory:\nhead = 0x1040; // points to Node A\nnewNode = 0x1000; // unlinked',
      },
      {
        stepNumber: 2,
        stepTitle: 'Step 2: Contrast the Two Assignment Orders (6 min)',
        durationMinutes: 6,
        instruction:
          'Demonstrate the failure case in the Constraint Correction Lab by executing `head = newNode` first. Show the red orphan indicators appearing on Node A, B, and C. Then hit Reset and step through `newNode->next = head` followed by `head = newNode`.',
        cCodeExample: '// The invariant rule:\nnewNode->next = head; // 1. Save reference to 0x1040 first\nhead = newNode;       // 2. Safe to repoint head to 0x1000',
      },
      {
        stepNumber: 3,
        stepTitle: 'Step 3: 5-Minute Invariant Proof Check (5 min)',
        durationMinutes: 5,
        instruction:
          'Give students 3 minutes in Learning Studio to articulate the loop invariant proof for head insertion in words or dictation. Verify that their explanation accounts for reachability of node A.',
      },
    ],
    workbenchExerciseTitle: 'Insert Node at Beginning of A -> B -> C',
    studioQuestionId: 'q-ll-head-insert',
  },
};

