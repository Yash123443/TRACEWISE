# Tracewise — Adaptive DSA Reasoning Workbench

Tracewise is an adaptive exam preparation tutor for Data Structures & Algorithms (DSA) built specifically to **investigate, audit, and coach a student's reasoning and mathematical invariants**, rather than serving as a generic solution chatbot.

## Core Architectural Pillars

1. **Distinctive Reasoning-First Identity**:
   - Slate & Teal calm diagnostic palette (`#0f172a`, `#0d9488`, `#f8fafc`).
   - Clean typographic rhythm with dedicated monospace notation for invariants, memory pointers, and asymptotic bounds ($O(N)$, $O(\log N)$, $O(1)$).
   - Designed as a workbench for reasoning verification: statement $\to$ target invariants $\to$ boundary analysis $\to$ proof expression.

2. **Full Responsive Navigation**:
   - **Overview**: Student diagnostic overview with next recommended focus action, mastery tracking across 4 core tracks, due spaced revisions, and past reasoning logs.
   - **Learn Studio**: Split workbench featuring the problem specification and a large expression field supporting typing and real-time voice dictation (Web Speech API with simulation fallback).
   - **Memory Workbench**: Interactive linked-list heap memory canvas (2D accessible and 3D spatial view), step-by-step operation tree, prediction prompts, constraint correction lab, and transfer reasoning.
   - **Concept Map**: C Syllabus prerequisite graph linking raw memory pointers, self-referential structs, heap allocation, ADTs, trees, graphs, and search/sort operations.
   - **Revision Queue**: Spaced repetition queue with scheduling rationale, C invariant traps, revise actions, interactive demo completion state, and empty/loading/error state handling.
   - **Teacher**: Cohort-level diagnostic screen highlighting common student misconceptions and bottleneck concepts.

3. **Accessibility & Keyboard Navigation**:
   - `Alt + 1` to `Alt + 6`: Instant navigation between all screens (`Alt+5` for Revision Queue).
   - `Ctrl + Enter`: Open reasoning trace review and audit dialog in studio.
   - `← / → / ↑ / ↓`: Navigate between items and graph nodes.
   - `Space`: Play / Pause auto-step trace playback in workbench.
   - `R`: Reset memory trace to Step 0.
   - `Esc`: Close any active dialog or drawer.
   - `?`: Toggle keyboard shortcuts cheatsheet.
   - Explicit `focus-visible` rings on all interactive elements.

4. **Multi-State Simulation Controls**:
   - A floating inspector bar enables toggling across **Populated**, **Loading** (skeleton loaders), **Empty**, and **Error** states at any moment for evaluation and review.

---

## Student Revision Queue System

Models the spaced repetition workflow designed around retrying fragile mathematical invariants before retention decays:

### Core Queue Capabilities:
- **Concept & Problem Identification**: Clearly links each item to both its parent concept (e.g. *Linked Lists & Pointer Re-wiring*) and target question title (e.g. *Valid Palindrome II*).
- **Due Status Tiers**:
  - **Due Now**: Actionable today with amber alert indicators and retention decay flags.
  - **Upcoming**: Scheduled for future spaced review (e.g. *Upcoming in 2 Days*, *Upcoming in 4 Days*).
  - **Completed**: Reviews completed during the current or past session, with recorded timestamps.
- **Diagnostic Scheduling Reason**: Explains *why* the item was queued (e.g. *"Scheduled because your last trace session showed hesitation when branching two pointers on mismatch boundary conditions"*).
- **Related Invariant Traps**: Highlights specific C misconceptions (e.g. *Premature Link Overwrite*, *Dangling Pointer Reference*, *Local BST vs Global Invariant*, *Stack Underflow on Unmatched Closing Bracket*) with C code snippets.
- **Revise in Studio Action**: Clickable CTA that immediately routes to the Learning Studio with that specific problem pre-loaded.
- **Interactive Completion State**:
  - Does **not** imply a real task was finished unless the demo interaction records it.
  - "Mark Reviewed" button records a local timestamped completion state (`Completed in Session`), updates queue counts, and offers an "Undo Done" toggle.
- **Useful State Handling**:
  - **Empty State**: Clear, encouraging guidance when all due items are completed or filters yield zero results.
  - **Loading State**: Responsive skeleton cards with subtle pulse animations.
  - **Error State**: Actionable retry banner wired to local state management.

---

## File Structure

```
src/
├── types/
│   ├── tracewise.ts             # TypeScript models for student progress, questions, and submissions
│   ├── workbenchTrace.ts        # Pure data contract for memory simulator nodes, snapshots, and predictions
│   ├── conceptGraph.ts          # Pure data contract for C syllabus concept graph, edges, and misconceptions
│   └── revision.ts              # Pure data contract for spaced revision items, due statuses, and reasons
├── mock/
│   ├── demoData.ts              # Labeled mock dataset for CS201 exam & interview preparation
│   ├── linkedListTraceFixture.ts # Separated trace fixture for Linked-List head insertion
│   ├── cConceptGraphFixture.ts  # Separated C syllabus concept graph with labeled edges
│   └── revisionFixture.ts       # Separated spaced revision queue fixture with C DSA review items
├── services/
│   └── apiService.ts            # Adapter from the shared learning engine service to screen data
├── hooks/
│   ├── useSpeechToText.ts       # Web Speech API recognition hook with fallback speech simulator
│   └── useKeyboardShortcuts.ts  # Hotkey listener for navigation, submission, stepping, and modals
├── components/
│   ├── common/
│   │   ├── Badge.tsx            # Context badges (teal, amber, red, neutral)
│   │   ├── Button.tsx           # Accessible button with loading states
│   │   ├── Card.tsx             # Card containers (Header, Body, Footer)
│   │   ├── Modal.tsx            # Accessible modal dialog with focus trap and escape handler
│   │   ├── Skeleton.tsx         # Skeleton loader placeholders
│   │   ├── StateSwitcher.tsx    # Live state toggle toolbar (Populated, Loading, Empty, Error)
│   │   └── ShortcutsModal.tsx   # Keyboard cheatsheet modal
│   ├── layout/
│   │   └── AppHeader.tsx        # Responsive sticky header with brand mark, tabs, and user status
│   ├── revision/
│   │   ├── RevisionScreen.tsx       # Complete revision queue screen with search, filters, and empty/error states
│   │   ├── RevisionCard.tsx         # Individual revision card with scheduling reason, trap accordion, and actions
│   │   └── RevisionStatusBadge.tsx  # Accessible status pill combining text, icon, and color
│   ├── conceptMap/
│   │   ├── ConceptMapScreen.tsx          # Dual-panel screen with filters, search, and view switcher
│   │   ├── ConceptGraph2D.tsx            # Responsive 2D tiered concept hierarchy with keyboard navigation
│   │   ├── ConceptGraph3DPlaceholder.tsx # Restrained 3D isometric boundary slot for Three.js
│   │   ├── ConceptDetailPanel.tsx        # Detail inspector: description, C syntax, C traps, next activity
│   │   └── StatusIndicator.tsx           # Accessible status badge combining text, icon, and color
│   ├── workbench/
│   │   ├── InteractiveMemoryWorkbench.tsx # Coordinator screen for the memory trace experience
│   │   ├── LinkedListVisualizer2D.tsx     # Accessible 2D SVG/DOM heap memory visualizer
│   │   ├── MemoryVisualizer3DPlaceholder.tsx # Restrained 3D isometric boundary (slot for Three.js)
│   │   ├── OperationTreeStepper.tsx       # Interactive operation tree step list
│   │   ├── PredictionStepCard.tsx         # Invariant prediction prompt with conceptual feedback
│   │   ├── ConstraintCorrectionLab.tsx    # Interactive preset & custom pointer rewiring lab
│   │   ├── PlaybackControls.tsx           # Step forward/back, undo, reset, and play/pause controls
│   │   └── TransferQuestionCard.tsx       # Transfer question placeholder for engine evaluation
│   ├── landing/
│   │   ├── LandingPage.tsx                     # Main landing page orchestrator & footer
│   │   ├── LandingHero.tsx                     # Core proposition heading & primary action triggers
│   │   ├── ConceptConstellationVisual.tsx      # Restrained 2D & isometric 3D concept constellation
│   │   ├── LearningLoopSection.tsx             # 4-stage reasoning loop: Explain, Trace, Correct, Practice
│   │   ├── WorkbenchPreviewSection.tsx         # Labeled memory trace preview card (N into A -> B -> C)
│   │   └── TeacherValueSection.tsx             # Educator value proposition and diagnostics bridge
│   ├── overview/
│   │   ├── HeroNextActionCard.tsx      # Adaptive focus recommendation card
│   │   ├── ConceptProgressSection.tsx  # Track breakdown with category tabs & mastery progress
│   │   ├── DueRevisionSection.tsx      # Spaced repetition list highlighting past reasoning gaps
│   │   ├── RecentActivitySection.tsx   # Session logs with student's articulated reasoning snippets
│   │   └── StudentOverviewScreen.tsx   # Overview dashboard layout
│   ├── studio/
│   │   ├── QuestionCard.tsx            # Problem statement, test cases, and invariant checklist
│   │   ├── DictationToolbar.tsx        # Voice recording toggle, live transcript, and helper chips
│   │   ├── ExpressionEditor.tsx        # Large focusable expression field with word count & auto-save
│   │   ├── SubmissionReviewModal.tsx   # Pre-submission review & in-place edit modal
│   │   └── LearningStudioScreen.tsx    # Studio workbench layout
│   └── teacher/
│       ├── TeacherScreen.tsx                   # Main coordinator for class cohort analytics
│       ├── TeacherHeader.tsx                   # Header with simulated demo labels and cohort metadata
│       ├── ClassConceptMasteryChart.tsx        # Accessible concept mastery bars with target benchmarks
│       ├── TopLearningGapsCard.tsx             # Ranked deficits with affected student counts
│       ├── CommonMisconceptionsSection.tsx     # Frequency of recurring algorithmic flaws
│       ├── StudentsNeedingSupportSection.tsx   # Visible demo threshold student intervention queue
│       ├── ReteachSuggestionCard.tsx           # Actionable 3-step lesson blueprint for top class gap
│       └── TeacherDetailPanel.tsx              # Interactive supporting diagnostic data inspector
├── App.tsx                      # Root shell and tab coordinator
├── main.tsx                     # React root mount
└── index.css                    # Tailwind CSS base styles & typography tokens
```

---

## Exact Class-Analytics Data Contract Needed from Learning Engine Developer

When the real teacher analytics backend is connected, replace [`src/mock/teacherAnalyticsFixture.ts`](file:///c:/Users/rajra/OneDrive/Desktop/Whisperflow/src/mock/teacherAnalyticsFixture.ts) by connecting the teacher analytics endpoint:

**Endpoint:** `GET /api/v1/teacher/analytics`

```typescript
export interface TeacherAnalyticsApiResponse {
  metadata: {
    cohortId: string; // e.g. "CS201-FALL2026"
    courseCode: string; // e.g. "CS201"
    courseTitle: string; // "Data Structures & Program Design in C"
    semester: string; // "Fall 2026"
    studentsRepresented: number; // e.g. 48
    datasetLabel: string; // "Simulated Demo Data"
    datasetDisclaimer: string;
    lastSynthesized: string; // ISO 8601 string
    evaluationScope: string; // e.g. "Diagnostic Midterm Checkpoint"
  };

  supportThreshold: {
    thresholdDescription: string; // Visible rule string
    masteryCutoffPercent: number; // e.g. 60
    misconceptionsCutoffCount: number; // e.g. 2
    studentsBelowThresholdCount: number; // Pre-calculated matching count
    totalStudents: number; // e.g. 48
  };

  conceptsMastery: Array<{
    conceptId: string; // e.g. "dynamic-memory", "pointers", "linked-lists"
    conceptName: string;
    category: string;
    classMasteryPercent: number; // 0 - 100
    benchmarkTargetPercent: number; // e.g. 85
    gapPercent: number; // target - classMastery
    masteryTier: 'solidified' | 'developing' | 'critical_gap';
    masteryTierLabel: string; // e.g. "Critical Gap (52%)"
    distribution: {
      solidifiedStudents: number;
      developingStudents: number;
      criticalGapStudents: number;
    };
    supportingDetail: {
      description: string;
      primaryFailurePoint: string;
      representativeAssessmentTask: string;
      sampleErrorSnippet: string; // C code illustrating the failure
      affectedSubtopics: string[];
      recommendedExerciseName: string;
    };
  }>;

  topLearningGaps: Array<{
    rank: number; // 1, 2, 3
    conceptId: string;
    conceptName: string;
    category: string;
    classAveragePercent: number;
    benchmarkPercent: number;
    gapPercent: number;
    urgency: 'critical' | 'moderate' | 'elevated';
    urgencyLabel: string; // e.g. "Top Class Gap"
    affectedStudentCount: number; // e.g. 21
    totalStudents: number; // e.g. 48
    coreObstacle: string;
  }>;

  commonMisconceptions: Array<{
    id: string; // e.g. "misc-head-overwrite"
    conceptId: string;
    conceptName: string;
    patternTitle: string;
    studentCount: number; // e.g. 23
    totalCohort: number; // e.g. 48
    prevalencePercent: number; // e.g. 48
    totalOccurrences: number; // e.g. 39
    severity: 'high' | 'medium' | 'low';
    severityLabel: string; // e.g. "High Prevalence"
    cCodeTrapSnippet: string; // Canonical flawed student C code
    invariantViolation: string; // Invariant breakdown
    diagnosticSocraticPrompt: string; // Prompt for instructor to use during reteach
    suggestedActionLabel: string;
    targetStudioQuestionId?: string;
  }>;

  studentsNeedingSupport: Array<{
    studentId: string; // e.g. "sim-std-104"
    displayIdentifier: string; // e.g. "Simulated Learner #104"
    isSimulated: boolean; // Must be true for demo data
    masteryPercent: number;
    primaryStruggleConcept: string;
    flaggedMisconceptions: string[];
    flaggedCount: number;
    urgencyLevel: 'immediate' | 'monitor';
    recommendedIntervention: string;
    suggestedAction: 'review_workbench' | 'assign_practice';
    targetStudioQuestionId: string;
  }>;

  reteachSuggestion: {
    targetGapConceptId: string;
    targetGapConceptName: string;
    gapMagnitudeText: string;
    title: string;
    durationEstimate: string; // e.g. "15-Minute Micro-Lecture & Lab"
    pedagogicalRationale: string;
    suggestedFormat: string;
    actionSteps: Array<{
      stepNumber: number;
      stepTitle: string;
      durationMinutes: number;
      instruction: string;
      cCodeExample?: string;
    }>;
    workbenchExerciseTitle: string;
    studioQuestionId: string;
  };
}
```

## Connecting the backend

The frontend imports the typed engine service from `../TRACEWISE/src/engine/service`. The browser service evaluates answers, updates the evidence-v1 learner state, schedules revisions, selects recommendations, and persists each learner profile through a storage interface backed by `localStorage`. `src/services/apiService.ts` adapts engine contracts to the existing screen models, keeping that integration seam stable as either side evolves. No HTTP server is required for this local engine architecture.

The teacher page includes the real engine aggregate summary, while its detailed cohort panels remain explicitly labeled demo data because their metric contract is richer than the engine aggregate. The concept map's supplementary syntax, misconception explanations, and demographic preview also remain fixture content; learner mastery itself is shown from the engine on the overview screen.

---

## Exact Revision Data Contract Needed from Learning Engine Developer

When the real spaced repetition service is connected, replace [`src/mock/revisionFixture.ts`](file:///c:/Users/rajra\OneDrive\Desktop\Whisperflow\src\mock\revisionFixture.ts) by connecting the revision endpoint (e.g. `GET /api/v1/revisions/queue`):

```typescript
export interface RevisionQueueApiResponse {
  fixtureVersion: string; // e.g. "2.0.0"
  fixtureNotice: string;
  items: Array<{
    id: string; // Unique revision item ID
    conceptId: string; // e.g. "linked-lists", "dynamic-memory", "trees"
    conceptTitle: string; // Human-readable concept name
    questionId: string; // Foreign key to learning studio problem ID
    questionTitle: string; // Problem title
    category: string; // e.g. "Arrays & Two Pointers", "Dynamic Heap & Structures"
    dueStatus: 'due_now' | 'upcoming' | 'completed';
    dueBadgeText: string; // e.g. "Due Now", "Upcoming in 2 Days", "Completed Today"
    scheduleReason: string; // Pedagogical reason why spaced review was scheduled
    relatedMisconception?: {
      title: string;
      explanation: string;
      cTrapSnippet?: string; // Canonical C pitfall code
    };
    estimatedMinutes: number;
    difficulty: 'Foundational' | 'Intermediate' | 'Advanced';
    retentionDecayPercent?: number; // Pre-calculated retention level from model (0 to 100)
    completedAt?: string; // ISO 8601 string or null if not yet completed
    isDemoRecord: boolean;
  }>;
}
```

And for recording completions, the backend should expose:
`POST /api/v1/revisions/:id/complete`
```json
{
  "revisionId": "rev-01",
  "completedAt": "2026-10-31T16:00:00.000Z",
  "reasoningConfidence": "verified_invariant"
}
```
