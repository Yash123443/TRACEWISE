# TRACEWISE repository rules

- Stack: React + Vite + TypeScript, Zod for validation, Vitest for tests. No backend server. Persistence is browser localStorage behind a storage interface.
- All engine code lives in `src/engine` and must be pure TypeScript with no React imports.
- Never edit `src/ui`.
- Mastery and scheduling are computed in deterministic code, never by free text.
- The learner model is a documented evidence score named `evidence-v1`. Do not call it BKT.
- Every evaluation has `source: "llm" | "rule" | "fixture"`. Demo class data must be flagged simulated.
- Evidence quotes must be exact substrings of the student's submitted text.
- Ambiguous or insufficient answers return a clarification request, never a forced diagnosis.
- Concepts not yet assessed show status `"not_assessed"`, never a fake score.
- A misconception becomes `"corrected"` only after correct reasoning on a different question.
- Every function that depends on time takes a `now: Date` parameter.
- Write Vitest tests for all logic. Run `npm test` before finishing.
- Do only what the current prompt asks. Do not add features, UI, or refactor unrelated files.
