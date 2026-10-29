# AutoForge — The AI-Native Developer Browser

> **HackDriven Build Arena**: *Build an AI-Native Browser with an Autonomous Multimodal Companion Using AdaL*  
> **Team:** Code Ninjas (Shashwat Shukla, Aditya Kumar, Shasmit Dwivedi, Pranjal Singh)  
> **Current Version:** `v1.4` (Execution & Real Verification Milestone)

---

## 🚀 Overview & Core Problem

Traditional AI assistants generate code and text in isolation, forcing developers to manually switch between editors, browser tabs, terminal windows, and testing suites. Most generated applications rely on default templates, generic boilerplate, and unverified assumptions.

**AutoForge** is an AI-native desktop browser and multimodal workspace that unifies browsing, autonomous task execution, code generation, outcome verification, and GTM packaging:
1. **BROWSE**: Native Chromium browser engine with live Chrome DevTools Protocol (CDP 1.3) Semantic Accessibility Tree extraction (`Accessibility.getFullAXTree`), making web interaction immune to fragile CSS/DOM redesigns.
2. **BUILD**: A 7-Agent Anti-Boilerplate Council (Aesthetics, Architecture, Syntax, Security, Platform, Visual QA, GTM) that eliminates generic AI templates and enforces production-ready standards.
3. **AUTOMATE**: Autonomous multi-step workflows with **independent outcome verification** (e.g., researching 10 AI startups, writing to a real CSV file on disk, and reading back every cell to verify accuracy and flag unknown pricing).
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
1. **Autonomous Research**: Scrapes and analyzes 10 AI companies (Anthropic, OpenAI, SylphAI, Perplexity, Mistral, Cursor, ElevenLabs, ArmorIQ, Cognition, Midjourney).
2. **Real Disk Persistence**: Generates `artifacts/ai_startups_matrix.csv` on disk with structured columns (`Startup`, `Product`, `Pricing`, `Source_URL`, `Verification_Status`).
3. **Independent Read-Back Verification**: The `OutcomeVerifier` re-opens the file from disk, confirms row count (10/10), validates 50 cells, and flags entries with non-public or custom pricing (e.g., ArmorIQ and Cognition sales gates) as `FLAGGED_REQUIRES_REVIEW`.
4. **Direct Download**: Provides the verified artifact directly to the user via `/api/spreadsheet/download`.

---

## 🛠️ Mandatory AdaL by Sylph Workflow Integration

AutoForge satisfies the mandatory AdaL track requirement:
- **Development & Refactoring**: AdaL by Sylph was used to architect the CDP bridge, debug `semanticBrowser.ts`, and refine the multi-agent critique council.
- **Custom Skill**: Configured in [`.atskills/autoforge-ui-critic/SKILL.md`](.atskills/autoforge-ui-critic/SKILL.md).
- **Runtime Integration**: Connects via `backend/orchestrator.py` with custom `can_use_tool` security hooks.

---

## ⚙️ Quickstart & Local Setup

### 1. Prerequisites
- Node.js >= 18
- Python >= 3.10
- FFmpeg (for video compositing)

### 2. Frontend & Electron Desktop App
```bash
# Install dependencies
npm install

# Build desktop application
npm run build

# Start live development environment (Vite + Electron)
npm run dev
```

### 3. Backend Orchestration Server
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
- `v1.4`: Execution & Verification Milestone (Real webview navigation, OutcomeVerifier engine, real spreadsheet disk write & readback, ArmorIQ fail-closed bugfix, clean `npm run build`).
