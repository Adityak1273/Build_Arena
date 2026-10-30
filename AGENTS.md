# AutoForge v1.7 — Build Arena Track 3 Submission with AdaL

## 1. Project Overview & Architecture
**AutoForge** is an AI-native desktop browser and browser-integrated workspace featuring an autonomous multimodal companion built for **HackBriven Build Arena Track 3: AI-Native Browser with an Autonomous Multimodal Companion Using AdaL**.

AutoForge bridges the gap between passive web display and active, verified agentic execution. It operates live browser contexts, executes multi-step workflows, verifies outcomes with cryptographic and disk-level integrity checks, and guarantees user control through a cryptographic Policy Approval Gate.

### System Ports & Runtime Topology
- **Frontend UI Shell**: Running on port `http://localhost:3000` (Vite / React 18 / Tailwind CSS / Framer Motion / Electron 29 Shell).
- **Backend Autonomous Runtime**: Running on port `http://localhost:4000` (Node.js / TypeScript / Express / `ws` WebSocket / Playwright Chromium CDP).
- **CDP Remote Debugging Port**: `http://localhost:9222` (Playwright Chromium session with full accessibility tree, screenshot capture, and DOM telemetry).

```
   ┌─────────────────────────────────────────────────────────────┐
   │         AutoForge Desktop Workspace (Electron / React)      │
   │  [Browse Mode]   [Build Mode]   [Automate Mode]   [Create]  │
   └───────────────▲─────────────────────────────▲───────────────┘
                   │ HTTP REST (4000)            │ WebSocket (4000)
                   ▼                             ▼
   ┌─────────────────────────────────────────────────────────────┐
   │         AutoForge Autonomous Runtime (TypeScript / Node)    │
   │                                                             │
   │   ┌──────────────────┐   ┌──────────────────────────────┐   │
   │   │ Playwright CDP   │   │ AdaL Autonomous Planner      │   │
   │   │ Browser Control  │   │ & Seven-Critic Review Council│   │
   │   └────────┬─────────┘   └──────────────┬───────────────┘   │
   │            │                            │                   │
   │            ▼                            ▼                   │
   │   ┌──────────────────┐   ┌──────────────────────────────┐   │
   │   │ Policy Approval  │   │ Closed-Loop Outcome Verifier │   │
   │   │ Gate (VIGIL-Spec)│   │ (DOM + Disk State Validated) │   │
   │   └──────────────────┘   └──────────────────────────────┘   │
   └─────────────────────────────────────────────────────────────┘
```

---

## 2. AdaL Compliance & Integration
**AdaL** by Sylph is integrated as the foundational reasoning and planning engine for AutoForge:
1. **Adaptive Agentic Planning**: Used to decompose complex goals into discrete, verifiable action steps (`navigate`, `click`, `type`, `extract`, `synthesize`, `export`).
2. **Deterministic & Model-Driven Council**: 7 specialized code and workflow critics (Architecture, Security & Sandboxing, Type Safety, Performance, Verification Integrity, User Experience, Error Resilience) that audit tasks prior to execution.
3. **Execution Transparency**: Every action is mapped to an `IntentToken` signed with SHA-256 hashes, ensuring zero hallucinated actions or fabricated results.

---

## 3. Core Runtime Subsystems

### A. Playwright CDP Browser Controller (`src/runtime/browserController.ts`)
- Manages an automated Chromium browser instance via Playwright.
- Connects directly or launches Chromium with `--remote-debugging-port=9222`.
- Executes hardware actions:
  - `navigate`: Smart URL resolution, network idle wait, live title/URL capture.
  - `click`: Real DOM target resolution, human-like interaction delay.
  - `type`: Keyboard input simulation with focus validation.
  - `extract`: Full semantic text, accessibility attributes, and page metadata extraction.
- Captures live Base64 JPEG screenshots (quality 75) after every action and streams them over WebSocket.

### B. Closed-Loop Outcome Verifier (`src/verifier/outcomeVerifier.ts`)
- Eliminates fake success states by verifying both runtime browser DOM state and persisted disk artifacts.
- **Browser State Verification**:
  - Validates active URL against expected target substrings.
  - Scans DOM content for required semantic keywords.
  - Transparently flags missing information as `flaggedUnknowns` instead of guessing or fabricating data.
- **Disk Artifact Verification**:
  - Computes SHA-256 integrity hash directly from disk.
  - Validates schema and column requirements for CSV/JSON exports (`startupName`, `coreProduct`, `pricingTiers`, `freeTrialAvailable`, `sourceUrl`, `flaggedUnknowns`).
  - Enforces minimum row thresholds and highlights enterprise sales gates honestly.

### C. Policy Approval Gate (`src/runtime/policyGate.ts`)
- VIGIL-compliant security policy gate for human-in-the-loop oversight.
- **Risk Classification**:
  - `LOW`: Safe queries, navigation, read-only DOM extraction (auto-approved).
  - `CONSEQUENTIAL`: Form submissions, authentication, file overwrites, payments, external API dispatch.
- Emits cryptographic `IntentToken` with Merkle root hashes and halts execution until human approval is delivered via WebSocket or UI Modal.
- Supports instant Emergency Cancel (`triggerEmergencyCancel()`) which halts all active workers and rejects pending requests.

### D. Pillar 1: Automated 10 AI Startups Matrix (`src/tools/startupSpreadsheetWorkflow.ts`)
- Conducts automated market research on 10 AI startups:
  1. SylphAI / AdaL
  2. ElevenLabs
  3. Serverpod
  4. Cursor
  5. Perplexity
  6. Runway
  7. Linear
  8. Supabase
  9. Suno
  10. Pika
- Gathers live company metadata, domain details, pricing tiers, and API availability.
- **Honest Pricing Policy**: If enterprise sales gates or unlisted pricing structures are encountered, they are recorded as `"UNKNOWN (Enterprise Contact Required)"` and flagged. No dummy prices are ever injected.
- Writes verified artifacts to `artifacts/ai_startups_comparison.json` and `.csv`.

### E. Pillar 2: Multimodal GTM Pipeline (`src/tools/gtmMultimodalPipeline.ts`)
- Orchestrates an end-to-end Go-To-Market launch workflow:
  - Generates comprehensive competitive positioning reports (`public/gtm-assets/gtm_launch_report.md`).
  - Synthesizes creative visual banners (`public/gtm-assets/hero_frame.png`).
  - Generates narration audio tracks (`public/gtm-assets/voiceover.mp3`).
  - Produces launch video assets (`public/gtm-assets/launch_video.mp4`).
- Validates all generated assets against disk size, MIME signatures, and SHA-256 hashes.
- Enforces Policy Approval Gate clearance prior to campaign distribution.
