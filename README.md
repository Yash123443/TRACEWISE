# Tracewise

Tracewise is a learning app for introductory data structures and algorithms. It helps students explain how they think, then gives feedback about the steps and invariants behind an answer. Its linked-list replay can turn an explanation into pointer operations and show their effect in a deterministic simulator.

The project includes a student-facing app, a teacher view with simulated class data, and a tested TypeScript engine. It is designed as a local demo and learning tool, not as a production classroom service.

## What you can do

- Work through diagnostic and recommended questions in the **Learn Studio**.
- See concept mastery, diagnostic progress, recent attempts, and review recommendations in **Overview**.
- Browse concepts, prerequisites, and tracked misconceptions in the **Concept Map**.
- Revisit scheduled practice in **Revision** and move the demo clock forward to see tasks become due.
- Replay linked-list pointer operations in the **Memory Workbench**, step through frames, and compare a learner trace with the reference.
- Explore simulated cohort summaries and reteaching suggestions in **Teacher**. The cohort contains 24 simulated learners; these are not live class records.

## A typical learner session

1. Start at **Home** and choose **Overview** or **Learn Studio**.
2. Answer a multiple-choice or explanation question. Explain questions can use a labelled demo sample, which remains editable. Wispr Flow can dictate into the text box as an external tool; there is no Wispr Flow API integration. Where supported, the browser also offers its own speech-recognition control.
3. Review and submit the answer. The result shows the evaluation, evidence, mastery explanation, and any next recommendation or scheduled revision.
4. For a linked-list replay result, choose **View memory replay** to inspect the pointer trace in the Workbench.
5. Use **Revision** to revisit due questions. The demo clock and reset controls affect the local demo learner state.

## How evaluation works

The engine owns the question bank, answer evaluation, learner history, mastery estimates, recommendations, revision schedule, and pointer simulation. The frontend adapts those engine results for its screens; it does not calculate mastery itself.

- Questions without a linked-list replay setup use the deterministic rule evaluator.
- Replay-supported linked-list questions can ask Gemini to interpret the learner's explanation as structured pointer operations.
- The server validates the proposed operation shape and quoted source text. The engine then runs the operations through its deterministic simulator before accepting the evaluation.
- If Gemini is not configured or its response cannot be used, the engine falls back to rule-based evaluation and identifies that fallback in the result.

Mastery is the deterministic `evidence-v1` estimate derived from recorded attempts. It is not a probabilistic student model or a validated measure of learning outcomes. Browser learner state is stored in `localStorage` when available, with an in-memory fallback if browser storage is unavailable.

## Run locally

Install dependencies from the repository root. The root install also installs the Frontend dependencies.

```sh
npm install
npm run dev
```

Open the local URL printed by Vite (normally `http://localhost:5173/`). If that port is already in use, Vite selects another port and prints it in the terminal.

### Optional Gemini setup

The app works without a Gemini key; replay interpretation falls back to the rule evaluator. To enable the server-side Gemini interpretation path, copy `.env.example` to `.env` and set `GEMINI_API_KEY` in `.env`:

```sh
# macOS / Linux
cp .env.example .env

# Windows PowerShell
Copy-Item .env.example .env
```

The checked-in defaults are:

| Variable | Default | Purpose |
| --- | --- | --- |
| `GEMINI_API_KEY` | empty | Key used by the development/preview server proxy. |
| `GEMINI_MODEL` | `gemini-3.5-flash-lite` | Primary interpretation model. |
| `GEMINI_FALLBACK_MODELS` | `gemini-3.8-flash,gemini-flash-lite-latest` | Comma-separated models tried after the primary model. |

Keep the key in `.env`; do not add it to frontend code or a `VITE_` variable. The proxy is registered by `Frontend/vite.config.ts` at `/api/ai/interpret` and keeps the key on the server side. Do not submit personal or sensitive information to an external AI service.

The proxy retries selected temporary failures, tries fallback models within a deadline, and returns sanitized errors. If no key is configured it returns `AI_NOT_CONFIGURED`; if the upstream cannot provide a usable response, the engine uses its rule fallback.

## Project commands

Run these from the repository root:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the student/teacher app and the AI proxy using the Frontend Vite configuration. |
| `npm test` | Run the engine and proxy tests with Vitest. |
| `npm run build` | Type-check the engine/server and build the Frontend app. |
| `npm run lint` | Run Oxlint. |
| `npm run preview` | Preview the built Frontend app; the Vite proxy middleware is also registered for preview. |

## Project structure

```text
Frontend/
  index.html
  vite.config.ts       # The app's single Vite configuration, including the AI proxy
  src/
    App.tsx            # Navigation and screen coordinator
    components/        # Home, Overview, Studio, Workbench, Concept Map, Revision, Teacher
    hooks/             # Speech recognition and keyboard shortcuts
    services/          # Frontend adapter to the engine service
    types/             # Frontend view types
src/engine/
  contracts/           # Schemas and shared engine types
  data/                # Concepts, misconceptions, and question bank
  evaluation/          # Rule evaluation, AI interpretation client, and verification pipeline
  learner/             # Evidence-based mastery and misconception tracking
  selector/            # Recommendations and revision scheduling
  service/             # Application service, browser storage, and service types
  simulator/           # Deterministic pointer-operation replay
  demo/                # Simulated class analytics and labelled demo samples
server/
  aiProxy.ts           # Server-side Gemini request, validation, retry, and fallback chain
  vitePlugin.ts        # Registers /api/ai/interpret in Vite dev and preview servers
fixtures/              # Contract and evaluation example JSON
```

There is one Vite configuration: `Frontend/vite.config.ts`. Root scripts call the Frontend app or reference this same configuration for test/build tooling.
