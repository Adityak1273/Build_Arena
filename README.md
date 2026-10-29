# AutoForge: The AI-Native Developer Browser

AutoForge is an AI-native desktop browser and autonomous companion workspace designed for developers. It combines native Chromium accessibility tree automation, an independent outcome verification engine, a 7-reviewer anti-boilerplate council, and a local intent policy gate.

---

## 🏛️ System Architecture & Implementation Realities

AutoForge is built with strict architectural separation between **genuinely implemented capabilities**, **deterministic rule-based systems**, and **optional model-backed integrations**.

### Pillar 1: AI-Native Browsing & Execution
- **Desktop Chromium Shell**: Built on **Electron 29+**, featuring real webview sessions, isolated context bridge, and standard web security policies (no header tampering).
- **CDP 1.3 Accessibility Protocol**: Connects directly to active Chromium sessions via Chrome DevTools Protocol (`Accessibility.getFullAXTree`), extracting live semantic interactive nodes (role, accessible name, backend DOM node ID, focus states).
- **Observable Postcondition Verification**: Dispatches native hardware mouse events (`Input.dispatchMouseEvent` for press and release) to box-model coordinates (`DOM.getBoxModel`). Verifies action postconditions (URL change, focus acquisition, or accessibility tree mutation) and strictly distinguishes `ACTION_DISPATCHED` from `OUTCOME_VERIFIED`. Never clicks at arbitrary fallback coordinates.
- **Real-Time Telemetry**: Real measured CDP round-trip latency (ping) and live connection status. Displays `N/A` when measurement is unavailable or detached.

### Pillar 2: 7-Reviewer Anti-Boilerplate Council
- **7 Concurrent Specialized Reviewers**: Evaluated in parallel via Python `asyncio.gather`:
  1. *Aesthetics & Design Token Critic*: Scans for generic Tailwind palettes (`bg-slate-*`) and enforces custom CSS variables (`var(--forge-*)`).
  2. *Architecture & Pattern Critic*: Enforces line-count boundaries and modular custom hook extraction.
  3. *Idiomatic Syntax Critic*: Flags untyped `: any` / `as any` escape hatches and unhandled Promise rejections.
  4. *Security & Hardening Auditor*: Detects raw DOM innerHTML injections, hardcoded API secret patterns, and `eval()` constructs.
  5. *Platform & Cloud Integrator*: Audits physical transport layers (REST/WebSocket) and flags hardcoded mock fixtures.
  6. *Visual QA & Accessibility Critic*: Audits interactive tags for explicit ARIA roles, landmarks, and alt tags.
  7. *GTM & Growth Critic*: Evaluates developer call-to-action (CTA) triggers and value positioning.
- **Authentic Evidence & Unified Diffs**: Computes line-by-line violation references and generates real unified code diffs using Python's `difflib.unified_diff`.
- **Transparent Model Status**: Clearly labeled as a **Parallel Rule-Based Reviewer Council**. If `GEMINI_API_KEY` is configured in the environment, optional model synthesis is enabled; if missing, reports `UNAVAILABLE_NO_API_KEY` without fabricating agent execution logs.

### Pillar 3: Local Intent Policy Gate (Zero-Trust Security)
- **Local Policy Enforcement**: Deterministic regex and AST policy evaluation with HMAC-SHA256 Intent Token signing. (Operates as a local cryptographic policy gate, not an external third-party cloud service).
- **Fail-Closed Interception**: Destructive commands (e.g. `rm -rf`, `DROP TABLE`, destructive disk wiping) immediately halt execution with HTTP 403 `TASK_BLOCKED`.
- **Human-In-The-Loop Approval Loop**: Consequential operations halt execution and wait on an asynchronous server event (`asyncio.Event`) with a 60-second timeout. Clicking Approve resumes the pending execution; rejection or timeout halts execution.
- **One-Time Token Nonce**: Prevents token replay attacks across different operations.

### Pillar 4: Independent Outcome Verification & Fault Injection
- **Live Metadata Extraction**: Asynchronous Python `HTMLParser` crawler with standard TLS verification (`verify=True`).
- **Honest Provenance Tracking**: Records `retrieval_timestamp`, `fetch_status` (`HTTP_200`, `CONNECT_TIMEOUT`, etc.), `http_status_code`, and `data_provenance` for every row. If an external host fails or blocks access, it is recorded honestly without silent fallback text.
- **Physical Disk Read-Back Assertion**: Writes results to `artifacts/ai_startups_matrix.csv`, re-opens the file from disk, and asserts complete in-memory vs disk field parity and SHA-256 byte-level hash.
- **Separation of Concerns**: Strictly separates `disk_integrity_verified` (disk file matches in-memory bytes) from `source_data_verified` (all HTTP endpoints responded successfully).
- **Cached Snapshot Transparency**: Existing disk files are loaded honestly as `CACHED_SNAPSHOT` rather than pretending to be freshly executed.
- **Developer Fault-Injection Modes**:
  1. *Live Scraped Run*: Genuine live crawl of 10 configured startup targets with disk assertion.
  2. *Fault Injection: Unreachable Hosts*: Real TCP connection attempts to invalid/unroutable endpoints (`.invalid`, RFC 5737 TEST-NET) catching real `httpx.ConnectError` and proving honest failure halting (`FAILED_UNREACHABLE_HOSTS`).
  3. *Fault Injection: Disk Byte Corruption*: Deliberately tampers with physical CSV bytes and asserts that cryptographic round-trip check catches file corruption (`FAILED_CORRUPTION_DETECTED`).

### Pillar 5: Multimodal Video & Audio Compositor
- **Template-Based Video Compositor**: Composes 1080p (1920x1080) MP4 video packages using Pillow canvas rendering and subprocess FFmpeg execution with returncode and output size validation.
- **Honest Audio Labeling**:
  - If `ELEVENLABS_API_KEY` is configured and succeeds, outputs genuine spoken voiceover (`ELEVENLABS_LIVE_API`).
  - If unset or failed, explicitly reports `SYNTHETIC_TONE_PLACEHOLDER` with an acoustic chime. Does not misrepresent acoustic tones as spoken narration.
- **Runtime Metrics**: Displays actual measured canvas parameters (resolution, frame count, audio source) without fabricated metrics.

---

## 🛠️ Toolchain & Development Attribution

AutoForge was developed using a multi-tool agentic workflow:
- **AdaL CLI**: Utilized during the initial hackathon phase for repository scaffolding, directory architecture generation, and initial benchmark prototyping.
- **Credit Exhaustion & Final Hardening**: When trial credits for the AdaL session expired near completion, subsequent hardening passes, bug fixes, automated test suites, and cryptographic verification enforcement were implemented, tested, and pushed directly.

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v24)
- **Python**: 3.10+ (tested on Python 3.14)
- **FFmpeg**: Available on system PATH or auto-resolved via `imageio-ffmpeg`

### 2. Installation
```bash
# Clone repository
git clone https://github.com/Adityak1273/Build_Arena.git
cd Build_Arena

# Install Node dependencies
npm install

# Install Python backend dependencies
pip install -r backend/requirements.txt
```

### 3. Running the Backend Server
```bash
# Starts FastAPI server and WebSocket telemetry on http://127.0.0.1:8000
python app.py
```

### 4. Running the Desktop Application
```bash
# Compile TypeScript and Vite bundles
npm run build

# Launch Electron desktop application
npm start
```

### 5. Running Automated Tests
```bash
# Run complete Python backend test suite (20 tests)
npm run test:backend
# or directly:
pytest backend/tests
```

---

## 📂 Repository File Structure

```
Build_Arena/
├── app.py                      # Root FastAPI launcher script
├── package.json                # Electron, React 18, Vite & Tailwind configuration
├── vite.config.ts              # Vite + vite-plugin-electron build pipeline
├── index.html                  # Main viewport
├── electron/
│   ├── main.ts                 # BrowserWindow lifecycle, webview CDP session & telemetry IPC
│   ├── preload.ts              # ContextBridge secure IPC bridge
│   └── semanticBrowser.ts      # CDP Accessibility.getFullAXTree & postcondition click verifier
├── src/
│   ├── main.tsx                # React entrypoint
│   ├── App.tsx                 # Mode router, WebSocket listener & approval modal
│   ├── types.ts                # TypeScript contracts & data models
│   ├── services/
│   │   └── api.ts              # REST client & Electron bridge
│   ├── components/
│   │   ├── NavigationBar.tsx   # Top brand bar, Local Intent Gate badge & WS status
│   │   ├── ModeChips.tsx       # Segmented navigation pill dock
│   │   ├── ApprovalModal.tsx   # Human-in-the-loop consequential action modal
│   │   └── TelemetryDrawer.tsx # Real-time WebSocket event feed
│   └── views/
│       ├── BrowseMode.tsx      # Chromium shell, omnibox & filterable CDP AXTree inspector
│       ├── BuildMode.tsx       # 7-Reviewer Council breakdown, unified diffs & demo fixture
│       ├── AutomateMode.tsx    # 10 Startups matrix, autonomous task planner & fault injection bench
│       └── CreateMode.tsx      # GTM video compositor & ElevenLabs / tone audio player
├── backend/
│   ├── app.py                  # FastAPI REST endpoints & WebSocket /ws broadcaster
│   ├── orchestrator.py         # 7-Reviewer Council with AST line-detection & unified diffs
│   ├── verifier.py             # Live HTMLParser crawler, provenance tracker & disk assertion
│   ├── autonomous_runner.py    # Autonomous task planning, tool dispatch & outcome verification
│   ├── gtm_pipeline.py         # Template-based 1080p video compositor & audio synthesis
│   ├── security.py             # Local Intent Policy Gate (HMAC-SHA256 Intent Tokens)
│   ├── requirements.txt        # Python dependency manifest
│   └── tests/                  # Automated pytest suite (20 tests)
│       ├── test_verifier.py    # Crawler, TLS, provenance, round-trip & fault injection tests
│       ├── test_security.py    # Policy gate, fail-closed blocking & replay prevention tests
│       ├── test_orchestrator.py# 7 critics concurrency, diffs & line detection tests
│       ├── test_autonomous.py  # Autonomous planner, execution lifecycle & cancellation tests
│       └── test_gtm.py         # Video frames & audio fallback tests
└── artifacts/
    ├── ai_startups_matrix.csv  # Physical disk-verified benchmark matrix with provenance
    ├── autoforge_gtm_1080p.mp4 # 1080p composited video output
    └── latest_gtm_audio.wav    # Audio track artifact
```

---

## 🧪 Acceptance Check Summary

| Component | Test Executed | Actual Outcome | Status |
|:---|:---|:---|:---:|
| **Frontend & Electron Build** | `npm run build` | 1,601 modules transformed in 2.04s, 0 errors | **VERIFIED** |
| **Backend Test Suite** | `pytest backend/tests` | **20 passed in 4.63s** across all test modules | **VERIFIED** |
| **Physical Disk Parity** | `test_verifier_benchmark_roundtrip` | 10/10 rows verified byte-for-byte from disk with SHA-256 | **VERIFIED** |
| **Real Network Failure** | `test_verifier_fault_injection_offline` | Caught real connection errors (`ConnectError`, `ConnectTimeout`) | **VERIFIED** |
| **File Tampering Detection**| `test_verifier_fault_injection_corruption` | Detected disk row and byte mismatch (`FAILED_CORRUPTION_DETECTED`) | **VERIFIED** |
| **Policy Gate & Fail-Closed** | `test_destructive_intent_blocked` | Blocked `rm -rf` and `DROP TABLE` with HTTP 403 `TASK_BLOCKED` | **VERIFIED** |
| **One-Time Token Nonce** | `test_token_consumption_prevents_replay` | Blocked token reuse and tampered signatures | **VERIFIED** |
| **7-Reviewer Council** | `test_council_seven_critics_concurrency` | All 7 critics evaluated concurrently with real unified diffs | **VERIFIED** |
| **Autonomous Workflow** | `test_autonomous_execution_lifecycle` | Planned, dispatched tools, and verified postconditions | **VERIFIED** |
| **Media Compositor** | `test_gtm_audio_synthesis_tone_fallback` | Honest tone placeholder rendered; FFmpeg returncode validated | **VERIFIED** |
