# AutoForge — The AI-Native Developer Browser

> **HackDriven Build Arena**: *Build an AI-Native Browser with an Autonomous Multimodal Companion Using AdaL*  
> **Team:** Code Ninjas (Shashwat Shukla, Aditya Kumar, Shasmit Dwivedi, Pranjal Singh)  
> **Current Version:** `v1.5` (Reliability, Concurrency & Live Benchmark Suite)

---

## 🚀 Overview & Core Problem

Traditional AI assistants generate code and text in isolation, forcing developers to manually switch between editors, browser tabs, terminal windows, and testing suites. Most generated applications rely on default templates, generic boilerplate, and unverified assumptions.

**AutoForge** is an AI-native desktop browser and multimodal workspace that unifies browsing, autonomous task execution, code generation, outcome verification, and GTM packaging:
1. **BROWSE**: Native Chromium browser engine with live Chrome DevTools Protocol (CDP 1.3) Semantic Accessibility Tree extraction (`Accessibility.getFullAXTree`), making web interaction immune to fragile CSS/DOM redesigns.
2. **BUILD**: A 7-Agent Anti-Boilerplate Council (Aesthetics, Architecture, Syntax, Security, Platform, Visual QA, GTM) executing in parallel (<200ms latency) to eliminate generic AI templates and enforce production-ready standards.
3. **AUTOMATE**: Autonomous multi-step workflows with **independent outcome verification** (live HTTP research across 10 AI startups, writing to a real CSV file on disk, reading back every cell to verify accuracy, and flagging unknown pricing).
4. **CREATE**: Multimodal GTM studio with ElevenLabs voiceovers (SHA-256 audio caching) and FFmpeg 1080p video compositing.

---

## 🛡️ Zero-Trust Security: ArmorIQ CSRG Fail-Closed Gate

AutoForge integrates the **ArmorIQ Canonical Structured Reasoning Graph (CSRG)**:
- **Merkle-tree Intent Tokens**: Every plan is locked before execution, generating a signed intent token (`capture_plan` -> `get_intent_token`).
- **Fail-Closed Policy**: Destructive commands (e.g., `rm -rf`, `delete_database`, `DROP TABLE`) are blocked immediately. The system halts and reports honest failure instead of claiming false success.
- **Human-in-the-Loop Approval**: Consequential actions (file writes, database modifications, deployments) trigger an interactive **Approve / Reject / Manual Takeover** modal.

---

## 📊 Benchmark Challenge 1: Spreadsheet Write & Read-Back Verification

To satisfy **Pillar 1 (Outcome Verification)**, AutoForge executes the official benchmark workflow:
1. **Live Network Research**: Performs live HTTP checks across 10 AI companies (Anthropic, OpenAI, SylphAI, Perplexity, Mistral, Cursor, ElevenLabs, ArmorIQ, Cognition, Midjourney) recording HTTP status codes and latency.
2. **Physical Disk Persistence**: Commits `artifacts/ai_startups_matrix.csv` on physical disk with structured columns (`Startup`, `Product`, `Pricing`, `Source_URL`, `HTTP_Status`, `Latency_MS`, `Retrieved_At`, `Verification_Status`).
3. **Independent Read-Back Assertion**: The `OutcomeVerifier` re-opens the file from disk, confirms row count (10/10), validates 80 discrete cells, and flags entries with non-public or custom pricing (ArmorIQ and Cognition sales gates) as `FLAGGED_REQUIRES_REVIEW`.
4. **Failure Mode Test Bench**: Built-in judge testing tools to verify failure detection:
   - **Live Verified Run**: Normal 10/10 verified run.
   - **Offline Host Failure**: Tests unreachable domain and honestly emits `FAILED_UNREACHABLE_HOSTS`.
   - **Corruption Detection**: Tests tampered disk rows and detects field mismatches.
5. **Direct Download**: Provides the verified artifact directly via `/api/spreadsheet/download`.

---

## 🛠️ Mandatory AdaL by Sylph Workflow Integration

AutoForge strictly adheres to the mandatory AdaL track requirements:
- **Development & Refactoring**: AdaL by Sylph was used to architect the CDP bridge, debug `semanticBrowser.ts`, and eliminate false-success bugs in `orchestrator.py`.
- **Custom Skill**: Configured in [`.atskills/autoforge-ui-critic/SKILL.md`](.atskills/autoforge-ui-critic/SKILL.md).
- **Proof & Transcripts**: Documented in [`docs/adal_proof.md`](docs/adal_proof.md).

---

## 🏗️ Technical Stack (100% Unified Architecture)

- **Desktop Shell**: Electron 29 (Chromium) + `<webview>`
- **Frontend UI**: React 18 + TypeScript + Vite + Tailwind CSS
- **Browser Automation**: Chrome DevTools Protocol (CDP 1.3) + Accessibility Tree
- **Backend Service**: Python 3.10+ with FastAPI & WebSockets
- **Agent Orchestrator**: 7-Agent Anti-Boilerplate Council with parallel `asyncio.gather`
- **Security**: ArmorIQ CSRG signed Intent Tokens (fail-closed)
- **Multimodal**: ElevenLabs API + FFmpeg 1080p compositor

---

## ⚙️ Quickstart & Local Setup

### 1. Frontend & Desktop App
```bash
# Install dependencies
npm install

# Build desktop application
npm run build

# Start live development environment (Vite + Electron)
npm run dev
```

### 2. Backend Orchestration Server
```bash
# Install Python dependencies
cd backend
pip install -r requirements.txt

# Start FastAPI WebSocket Server on http://127.0.0.1:8000
python app.py
```

---

## 📈 Git Versioning Standards
- `v1.0`: Initial full-stack scaffolding (Electron, React, Backend, GTM, CDP).
- `v1.1`: Telemetry and WebSocket live streaming integration.
- `v1.2`: UI redesign with modern typography (Plus Jakarta Sans, JetBrains Mono).
- `v1.3`: YouTube-style pill tags, clean chips, and mode switcher polish.
- `v1.4`: Execution & Verification Milestone (Real webview navigation, OutcomeVerifier engine, real spreadsheet disk write & readback).
- `v1.5`: Reliability & Concurrency Milestone (Live network HTTP research, 7-Agent parallel Fan-Out via `asyncio.gather`, observable CDP click verification, 3-mode judge failure audit suite, and AdaL proof logs).
