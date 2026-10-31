# TRACEWISE

## Problem and target users

TRACEWISE helps introductory C and data-structure learners expose the mental-model error behind an answer. It supports students who need feedback on reasoning and instructors who need a compact class view.

## What makes TRACEWISE distinct

TRACEWISE records evidence-backed reasoning diagnoses. Mental Model Replay converts linked-list explanations into operations and verifies them with a deterministic simulator.

## Features and honest status

| Feature | Status |
| --- | --- |
| Diagnostic, concept graph, mastery ledger | Engine implemented and tested |
| Adaptive selection and spaced repetition | Engine implemented and tested |
| Misconception tracking and teacher analytics | Engine implemented and tested; class data is simulated |
| AI interpretation | Engine implemented and tested with verification and fallback |

The UI was built separately by a teammate in `src/ui`; no further UI claim is made here.

## How it works

AI proposes linked-list pointer operations; the simulator verifies them; deterministic code computes mastery and scheduling.

## Setup

```sh
npm install
copy .env.example .env
# Set GEMINI_API_KEY; GEMINI_MODEL is optional.
npm run dev
npm test
```

## Demo mode

Use labelled sample responses, the service reset function, and demo time control. Teacher analytics use clearly labelled simulated class data.

## AI and fallback behaviour

Gemini uses a server-side proxy, so its key is never browser code. Only linked-list replay questions use AI. If AI is unavailable or output fails validation, the rule evaluator is used and says so. AI runs under `npm run dev` or `npm run preview`.

## Limitations

Data is browser localStorage; the class is simulated; rule phrasing coverage is limited. Mastery is a documented `evidence-v1` estimate from recorded evidence, not BKT, and no learning-outcome study has been conducted. Google's free tier may use inputs to improve its models, so do not enter personal information.

Voice is Wispr Flow dictation into the focused text box. There is no Wispr Flow SDK or API integration; the project was built with Wispr Flow dictation plus AI coding agents.

## Team

Team members: _[Teammate 1]_ and _[Teammate 2]_.

## Repository layout

- `src/engine` — deterministic engine and demo logic
- `src/ui` — teammate-built interface
- `server` — AI proxy
- `fixtures` — schema examples
