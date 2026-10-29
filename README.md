# AutoForge: The AI-Native Developer Browser

AutoForge is a complete, native desktop developer browser shell and multimodal workspace engineered to eliminate generic boilerplate code and fragmented workflows.

---

## 🏛️ Architecture & System Pillars

### Pillar 1: AI-Native Browsing & Execution
- **Native Chromium Desktop Shell**: Built with **Electron 29+**, featuring `webviewTag: true`, context isolation, and hardware-accelerated rendering.
- **CDP 1.3 Accessibility Tree Protocol**: Direct attachment to active Chromium webviews via `Accessibility.getFullAXTree` and semantic interactive node extraction.
- **Observable Postcondition Verification**: Dispatches simulated native hardware mouse clicks and verifies postconditions (`urlChanged || axDiffCount > 0`).

### Pillar 2: 7-Agent Anti-Boilerplate Council & Zero-Trust Security
- **7 Concurrent Critics**: Evaluated in parallel via Python `asyncio.gather`:
  1. *Aesthetics & Design Token Critic*: Scans for generic Tailwind classes (`bg-slate-900`) and enforces custom CSS variables (`var(--forge-*)`).
  2. *Architecture & Pattern Critic*: Enforces line count limits (>250 lines) and custom hook abstractions.
  3. *Idiomatic Syntax Critic*: Detects untyped `: any` escapes and unhandled promises.
  4. *Security & Hardening Auditor*: Redacts hardcoded credentials, intercepts XSS vectors (`dangerouslySetInnerHTML`), and eliminates `eval()`.
  5. *Platform & Cloud Integrator*: Replaces volatile in-memory mock data with physical persistence.
  6. *Visual QA & Accessibility Critic*: Audits ARIA roles, landmarks, and WCAG AA contrast.
  7. *GTM & Growth Critic*: Synthesizes technical value propositions and conversion CTAs.
- **ArmorIQ CSRG Zero-Trust Security Gate**:
  - Cryptographic Merkle tree Intent Token engine (`SHA-256`).
  - **Fail-Closed Interception**: Destructive commands (e.g. `rm -rf`, `DROP TABLE`) immediately halt execution with `TASK_BLOCKED`.
  - **Human-In-The-Loop Approval**: Consequential operations require an explicit cryptographic human signature.

### Pillar 3: Independent Outcome Verification & Judge Test Bench
- **LiveWebpageExtractor**: Native Python `HTMLParser` that asynchronously scrapes live web pages for `<title>`, `<meta description>`, and pricing models.
- **Physical Disk Read-Back Assertion**: Writes 10 rows with 10 fields to `artifacts/ai_startups_matrix.csv`, re-opens the file from disk, and verifies cell parity against in-memory models.
- **3 Judge Test Bench Modes**:
  1. *Live Scraped Run*: 10/10 verified from disk, with 2 enterprise sales gates flagged (`Scale AI`, `Cohere`).
  2. *Offline Host Failure*: Demonstrates honest error reporting (`FAILED_UNREACHABLE_HOSTS`).
  3. *Corruption Detection*: Demonstrates disk read-back mismatch detection (`FAILED_CORRUPTION_DETECTED`).

### Pillar 4: Multimodal GTM Video Compositor
- **ElevenLabs API**: Voiceover synthesis with SHA-256 disk caching and synthetic offline fallback.
- **Pillow 1080p Canvas Engine**: Renders high-fidelity 1920x1080 frames with animated camera zoom and audio spectrum visualization.
- **FFmpeg 1080p Compositing**: Produces H.264 / AAC synchronized MP4 video assets.

---

## 🚀 Quickstart

### 1. Prerequisites
- Node.js 18+ (tested on Node v24)
- Python 3.10+ (tested on Python 3.14)

### 2. Frontend & Electron Shell
```bash
# Navigate to directory
cd autoforge

# Install dependencies
npm install

# Compile TypeScript and bundle Electron & React
npm run build

# Start Electron Desktop App
npm start
```

### 3. Python Backend Engine
```bash
# Start FastAPI and full-duplex WebSocket server on http://127.0.0.1:8000
python app.py
```

---

## 📂 Project Directory Structure

```
autoforge/
├── app.py                      # Root FastAPI & WebSocket launch script
├── package.json                # Electron, React 18, Vite & Tailwind configuration
├── vite.config.ts              # Vite + vite-plugin-electron build config
├── index.html                  # Main viewport with Plus Jakarta Sans & JetBrains Mono
├── electron/
│   ├── main.ts                 # BrowserWindow lifecycle, webview CDP session & IPC
│   ├── preload.ts              # ContextBridge secure IPC bridge
│   └── semanticBrowser.ts      # CDP Accessibility.getFullAXTree & postcondition click verifier
├── src/
│   ├── main.tsx                # React root mount
│   ├── App.tsx                 # Core workspace router, WebSockets & approval dialog
│   ├── index.css               # Design tokens (--forge-*) and dark theme
│   ├── types.ts                # TypeScript interfaces and contracts
│   ├── components/
│   │   ├── NavigationBar.tsx   # Top brand bar, WS indicator & ArmorIQ badge
│   │   ├── ModeChips.tsx       # YouTube-style clean chip navigation
│   │   ├── ApprovalModal.tsx   # Zero-trust human approval modal
│   │   └── TelemetryDrawer.tsx # Real-time WebSocket event feed
│   ├── views/
│   │   ├── BrowseMode.tsx      # Address bar, live Chromium webview & CDP AXTree inspector
│   │   ├── BuildMode.tsx       # Prompt bar & 7-Agent Council breakdown dashboard
│   │   ├── AutomateMode.tsx    # 10 AI Startups comparative matrix & Judge Test Bench
│   │   └── CreateMode.tsx      # GTM Launchpad: ElevenLabs player & 1080p video player
│   └── services/
│       └── api.ts              # REST client & Electron IPC bridge
├── backend/
│   ├── app.py                  # FastAPI server with WebSocket /ws & REST endpoints
│   ├── orchestrator.py         # 7-Agent Anti-Boilerplate Council with AST analysis
│   ├── verifier.py             # Live HTMLParser crawler & disk read-back assertion
│   ├── gtm_pipeline.py         # ElevenLabs synthesis, Pillow canvas & FFmpeg video compositor
│   ├── security.py             # ArmorIQ CSRG Merkle tree Intent Token engine
│   └── requirements.txt        # Python dependency manifest
└── artifacts/
    ├── ai_startups_matrix.csv  # Physical disk-verified benchmark matrix
    ├── autoforge_gtm_1080p.mp4 # 1080p composited video preview
    └── latest_gtm_audio.wav    # Synthesized voiceover audio track
```

---

## 🧪 Verification Check Results

| Check | Requirement | Result |
|---|---|---|
| 1 | `npm run build` TypeScript & Electron compilation | **PASSED** (0 errors, `dist/` & `dist-electron/` generated in 2.0s) |
| 2 | `python app.py` FastAPI & WebSocket startup | **PASSED** (Bound on `http://127.0.0.1:8000`, `/ws` open) |
| 3 | Startup benchmark physical disk parity | **PASSED** (`artifacts/ai_startups_matrix.csv`, 10/10 verified, 2 enterprise sales gates flagged) |
| 4 | ArmorIQ CSRG fail-closed interception | **PASSED** (Destructive commands halt with HTTP 403 `TASK_BLOCKED`) |
| 5 | Multimodal 1080p FFmpeg video compositing | **PASSED** (`artifacts/autoforge_gtm_1080p.mp4` rendered with synchronized audio) |
