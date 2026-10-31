# TRACEWISE team context

- Hackathon: Product Space Agentic AI Hackathon. Deadline: 31 Oct 2026, 11:59 PM IST.
- Scoring: Wispr Flow 20%, Prototype/UX 20%, AI integration 20%, Problem understanding 15%, LinkedIn 15%, Innovation 10%.
- Split: Person A owns `src/ui` only; Person B owns `src/engine` only.
- There is no HTTP backend. The browser engine service in `src/engine/service` connects the UI-facing service contract to deterministic engine functions and persists learner profiles to browser `localStorage` through a storage interface.
- The UI calls the functions listed in [CONTRACTS.md](./CONTRACTS.md) and builds against `fixtures/` first.

## UI rules

- Never calculate or invent mastery, class metrics, or diagnoses; display engine output.
- Always show `evaluation.source` (AI / rule / fixture) and label class data “simulated”.
- Concepts with `not_assessed` status show “Not assessed yet”, never a number.
- Evidence quotes are the student's own words.
- Preserve the student's answer if submission fails and disable submit while processing.
- Never use color alone; include text and a shape or icon.
- Support reduced motion, keyboard access, and a 2D fallback for any 3D view.
- Wispr Flow is external dictation into the focused box; never claim an SDK/API integration.

## Replay workbench

The UI steps, pauses, and scrubs through `Trace` frames, compares “your trace” with the correct trace, and calls `runReplay(operations)` after every learner action because the simulator is the source of truth.
