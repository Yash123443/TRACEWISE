# TRACEWISE contracts

All JSON examples below are illustrative contract shapes. `fixtures/` contains schema-validated examples for evaluation, trace, mastery, history, revision, and teacher aggregate data. Types and matching Zod schemas are exported from `src/engine/contracts/index.ts`. Optional means the property may be absent; nullable means it must be present and may be `null`.

## Data contracts

### Concept

Purpose: describe one curriculum concept and its prerequisite/support edges.

```json
{"id":"linked-list-head","name":"Linked list head","description":"Track the first node reference.","prerequisites":[],"misconceptionCodes":["lost-head-reference"],"diagnostic":true}
```

Expected behavior: prerequisite type is `requires` or `supports`; ids are stable. Edge case: no prerequisite edges is valid.

### Question

Purpose: define a diagnostic or practice question, answer key, and supported feedback/replay metadata.

```json
{"id":"q-head-1","conceptIds":["linked-list-head"],"type":"trace","prompt":"Insert N at the head of A->B->C.","answerKey":{"head":"N"},"difficulty":"intro","misconceptionMap":{"lost-head-reference":"lost-head-reference"},"isTransfer":false,"supportsReplay":true}
```

Expected behavior: options may be omitted for non-MCQ questions. Edge case: an MCQ may include options; the schema does not itself determine whether the answer key matches them.

### EvaluationResult

Purpose: report an answer evaluation, evidence, confidence, explanations, and provenance.

```json
{"status":"correct","concept_id":"linked-list-head","misconception_code":null,"evidence":["set the new node's next to the old head"],"confidence_band":"high","explanation":"That preserves the old list.","corrective_explanation":"","follow_up_question_id":null,"clarification_question":null,"source":"fixture"}
```

Expected behavior: evidence strings must be exact substrings of the submitted text; ambiguous answers return `uncertain` with a clarification request and no forced misconception code. Edge case: a low-information answer uses `insufficient_answer` and asks for clarification.

### OperationProposal

Purpose: turn learner-described pointer actions into explicit replay operations, or request clarification.

```json
{"status":"identified","operations":[{"op":"set_head","target":"N","source_text":"head = N"}],"clarification_question":null}
```

Expected behavior: operation variants are `allocate`, `capture`, `set_next`, and `set_head`; each retains exact source text. Targets may be node names, `head` (resolved at that step), `null`, or `$name` captured earlier. Edge case: unresolved or ambiguous actions use `uncertain`, an empty or partial operation list, and a clarification question.

### TraceFrame

Purpose: represent the state immediately after one operation in a replay.

```json
{"index":0,"operation":{"op":"set_head","target":"N","source_text":"head = N"},"nodes":{"N":{"next":null}},"head":"N","reachable":["N"],"unreachable":[],"note":"Head points to N."}
```

Expected behavior: `reachable` and `unreachable` describe nodes at this step. Edge case: empty state has empty node and reachability collections and a null head.

### Trace

Purpose: return all replay steps and the resulting list state.

```json
{"steps":[{"index":0,"operation":{"op":"allocate","node":"N","source_text":"allocate N"},"nodes":{"A":{"next":"B"},"B":{"next":"C"},"C":{"next":null},"N":{"next":null}},"head":"A","reachable":["A","B","C"],"unreachable":["N"],"note":"Allocated N with next set to null."},{"index":1,"operation":{"op":"set_next","node":"N","target":"head","source_text":"N.next = head"},"nodes":{"A":{"next":"B"},"B":{"next":"C"},"C":{"next":null},"N":{"next":"A"}},"head":"A","reachable":["A","B","C"],"unreachable":["N"],"note":"N.next now points to A, which is the head right now."},{"index":2,"operation":{"op":"set_head","target":"N","source_text":"head = N"},"nodes":{"A":{"next":"B"},"B":{"next":"C"},"C":{"next":null},"N":{"next":"A"}},"head":"N","reachable":["N","A","B","C"],"unreachable":[],"note":"Head now points to N."}],"final_head":"N","final_list":["N","A","B","C"],"unreachable_nodes":[]}
```

Expected behavior: steps retain their operation order; optional `error` reports invalid replay execution. Edge case: a pointer cycle must not loop forever; reachable listing includes each reached node once and the final frame note identifies the cycle.

The lost-nodes self-loop fixture for `allocate N`, `head = N`, `N.next = head` is:

```json
{"steps":[{"index":0,"operation":{"op":"allocate","node":"N","source_text":"allocate N"},"nodes":{"A":{"next":"B"},"B":{"next":"C"},"C":{"next":null},"N":{"next":null}},"head":"A","reachable":["A","B","C"],"unreachable":["N"],"note":"Allocated N with next set to null."},{"index":1,"operation":{"op":"set_head","target":"N","source_text":"head = N"},"nodes":{"A":{"next":"B"},"B":{"next":"C"},"C":{"next":null},"N":{"next":null}},"head":"N","reachable":["N"],"unreachable":["A","B","C"],"note":"Head now points to N."},{"index":2,"operation":{"op":"set_next","node":"N","target":"head","source_text":"N.next = head"},"nodes":{"A":{"next":"B"},"B":{"next":"C"},"C":{"next":null},"N":{"next":"N"}},"head":"N","reachable":["N"],"unreachable":["A","B","C"],"note":"N.next now points to N, which is the head right now. A cycle is present; traversal stops when a node repeats."}],"final_head":"N","final_list":["N"],"unreachable_nodes":["A","B","C"]}
```

### MasteryState

Purpose: represent a learner's current state for one concept.

```json
{"conceptId":"linked-list-head","status":"not_assessed","mastery":null,"attempts":0,"lastUpdated":null}
```

Expected behavior: `not_assessed` always has `mastery: null`; assessed states have a 0..1 score. Edge case: never use a placeholder numeric score for an unassessed concept.

### MasteryHistoryEntry

Purpose: explain a mastery change under the documented `evidence-v1` learner model.

```json
{"id":"h-1","attemptId":"a-1","conceptId":"linked-list-head","questionId":"q-head-1","before":{"conceptId":"linked-list-head","status":"not_assessed","mastery":null,"attempts":0,"lastUpdated":null},"after":{"conceptId":"linked-list-head","status":"developing","mastery":0.5,"attempts":1,"lastUpdated":"2026-10-31T10:00:00.000Z"},"reason":"One partially correct response adds initial evidence.","modelVersion":"evidence-v1","timestamp":"2026-10-31T10:00:00.000Z"}
```

Expected behavior: `reason` states why mastery changed, and before/after identify the same concept. Edge case: idempotent retries return the existing history entry without adding a second change.

### Attempt

Purpose: record the submitted answer, its source, and the associated evaluation.

```json
{"id":"a-1","idempotencyKey":"try-1","learnerId":"learner-1","questionId":"q-head-1","answerText":"N.next points to the old head.","inputMode":"typed","submittedAt":"2026-10-31T10:00:00.000Z","evaluation":{"status":"correct","concept_id":"linked-list-head","misconception_code":null,"evidence":["N.next points to the old head"],"confidence_band":"high","explanation":"Preserves the list.","corrective_explanation":"","follow_up_question_id":null,"clarification_question":null,"source":"fixture"},"evaluationSource":"fixture"}
```

Expected behavior: `reasoningText` and confidence are optional; confidence, when present, is 1..5. Edge case: repeated `idempotencyKey` returns the same recorded result without applying mastery twice.

### StudentMisconception

Purpose: track evidence for a learner misconception and its verification state.

```json
{"code":"lost-head-reference","status":"suspected","count":1,"evidenceAttemptIds":["a-1"]}
```

Expected behavior: statuses distinguish suspected, recurring, verification-needed, and corrected. Edge case: a misconception becomes `corrected` only after correct reasoning on a different question.

### RevisionTask

Purpose: schedule a specific question for concept review.

```json
{"id":"r-1","conceptId":"linked-list-head","questionId":"q-head-2","dueDate":"2026-11-01T10:00:00.000Z","priority":2,"reason":"Review after an incorrect answer.","status":"scheduled"}
```

Expected behavior: queue status reflects due dates relative to explicit `now`. Edge case: a task due at or before `now` belongs in `due`; completed tasks should not reappear as due.

### TeacherAggregate

Purpose: provide aggregate class insights for teacher-facing displays.

```json
{"dataSource":"simulated","learnerCount":12,"conceptMastery":[{"conceptId":"linked-list-head","average":0.62,"distribution":{"developing":5,"strong":2}}],"topMisconceptions":[{"code":"lost-head-reference","count":4}],"learnersNeedingAttention":[{"learnerId":"demo-4","reason":"Repeated difficulty preserving the head."}],"attentionThreshold":0.4,"reteachOutline":["Trace head updates"]}
```

Expected behavior: demo cohorts have `dataSource: "simulated"`; `attentionThreshold` is documented as the score at or below which a learner is flagged for attention. Edge case: an empty class has learnerCount 0 and empty collections, never invented averages for concepts with no assessed learners.

## How the UI should call the engine

Import the service implementation through `src/engine/service` and use the typed interface in `src/engine/service/types.ts`:

- `getConcepts(learnerId)` — retrieve the graph and per-concept mastery.
- `getDiagnosticQuestions()` — retrieve diagnostic questions.
- `submitAnswer(input)` — submit an answer with a stable idempotency key and explicit `now`.
- `getNextQuestion(learnerId, now)` — retrieve the next recommendation.
- `getRevisionQueue(learnerId, now)` — retrieve due and upcoming reviews.
- `getHistory(learnerId)` — retrieve mastery history.
- `getTeacherAnalytics()` — retrieve class aggregate output and display its data source.
- `runReplay(operations)` — replay learner operations; call after every learner action.
- `resetDemo(learnerId)` — reset demo learner state.
- `advanceDemoTime(days)` — advance the demo clock.

Every service method returns a Promise except `runReplay`, which may return a Trace synchronously or as a Promise. UI callers can `await` it either way. Services with time-dependent behavior receive explicit `now: Date`.

## Service behavior

`submitAnswer` is idempotent by `idempotencyKey`: repeating a key returns the stored result without evaluating or changing learner state. `nextRecommendation` and `revisionTask` in its result are nullable when no recommendation or review task exists.

The service also provides `getDiagnosticStatus(learnerId)`, `getQuestion(questionId)`, and `getMisconceptions(learnerId)`. Diagnostic status reports all six diagnostic questions, completion, and the current baseline; unassessed concepts retain `mastery: null`. `runReplay(operations, initial?)` accepts the simulator's optional initial list state.

`ServiceError` uses `QUESTION_NOT_FOUND`, `NO_RECOMMENDATION`, `EVALUATION_FAILED`, and `NOT_IMPLEMENTED` codes. An evaluation failure includes the original submitted `answerText` in its details, allowing the UI to preserve it.

Demo time is a persisted day offset. `advanceDemoTime(days)` adds to the offset and returns `clock() + offset`; `resetDemo(learnerId)` clears both that learner's state and the demo offset. Methods with a `now` argument use that supplied date unchanged. History is returned newest first.

On a learner's first attempt at a concept, history `before` shows mastery 0.5 as a STARTING ESTIMATE (before.attempts is 0), not a measured score. The UI should label it that way.

## AI evaluation

An evaluation with source `llm` means AI interpreted the explanation into pointer operations and a deterministic simulator verified the result. Source `rule` with an `AI interpretation was unavailable` sentence indicates rule-based fallback. Mastery never depends on unverified AI output. The development server proxies `/api/ai/interpret`; its API key remains server-side in `.env`, and its default model is `gemini-flash-lite-latest`. The AI path works only under `npm run dev` or `npm run preview`.
