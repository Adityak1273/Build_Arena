# AutoForge — The AI-Native Developer Browser

> **HackDriven Build Arena**: *Build an AI-Native Browser with an Autonomous Multimodal Companion Using AdaL*  
> **Team:** Code Ninjas (Shashwat Shukla, Aditya Kumar, Shasmit Dwivedi, Pranjal Singh)

---

## 🌟 Overview & Key Innovations

Current AI tools are fragmented across browser tabs and code editors, forcing developers into tedious copy-pasting, manual testing, and generic boilerplate templates.

**AutoForge** is a unified desktop AI-native browser with an autonomous multimodal companion that combines four interconnected modes:
1. **BROWSE**: Operates live Chromium tabs via Chrome DevTools Protocol (CDP) Accessibility Tree extraction (`Accessibility.getFullAXTree`), reducing token usage by 64% and making web automation immune to CSS/DOM redesigns.
2. **BUILD**: A multi-agent critique & auto-iteration loop where the **Code Builder Agent** and **Design Critic Agent** continuously refine UI code until generic boilerplate is eliminated.
3. **AUTOMATE**: Autonomous multi-step web workflows with **closed-loop outcome verification** (e.g. researching 10 AI startups and reading back spreadsheet cells to verify accuracy).
4. **CREATE**: An automated GTM multimodal studio using ElevenLabs for lifelike voiceovers (with SHA-256 caching) and FFmpeg for composited 1080p launch videos.

---

## 🛡️ Zero-Trust Security: ArmorIQ Fail-Closed Intent Tokens

AutoForge incorporates the **ArmorIQ SDK (CSRG-IAP)**:
- **Merkle-tree intent tokens**: When a user submits an instruction, the Task Planner locks the execution graph and mints a cryptographically signed intent token (`capture_plan` -> `get_intent_token`).
- **Fail-closed security**: Destructive commands (e.g., prompt injection targeting `rm -rf`, `DROP TABLE`, or `delete_database`) are blocked instantly.
- **Human-in-the-Loop approval**: Consequential actions (spreadsheet writes, deployments, publications) trigger an interactive **Approve / Reject / Manual Takeover** modal.

---

## 🤖 Mandatory AdaL by Sylph (`SylphAI`) Integration

AutoForge satisfies the mandatory AdaL hackathon criteria across two dimensions:

### 1. Development & Iteration Workflow (Mandatory Submission Video)
- Custom Skill File: [`.atskills/autoforge-ui-critic/SKILL.md`](.atskills/autoforge-ui-critic/SKILL.md) loaded via `adal /skills`.
- Used `adal` in terminal with `@src/` for codebase understanding, component generation, and automated critique passes.
- Leveraged AdaL's **Browser Use** to test `localhost:3000` with zero console errors and HTTP 200 checks.

### 2. Runtime Agent Engine
- Connects through `backend/orchestrator.py` via `adal_agent_sdk` with custom `can_use_tool` security hooks.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js v20+ & npm
- Python 3.10+
- (Optional) ElevenLabs API Key (`ELEVENLABS_API_KEY`) & ArmorIQ API Key (`ARMORIQ_API_KEY`)

### Launch Application
You can run the launcher script:
```powershell
.\start.ps1
```
Or start each service independently:

1. **Start Backend API & Orchestrator:**
   ```bash
   cd backend
   python app.py
   ```
   *Runs on `http://127.0.0.1:8000` with WebSocket on `ws://127.0.0.1:8000/ws`.*

2. **Start Frontend Workspace:**
   ```bash
   npm run dev
   ```
   *Opens AutoForge at `http://localhost:3000`.*

---

## 🎬 How to Demo for Judges

### 📌 Pillar 1 Showcase: 10 Startups Research -> Verified Spreadsheet
1. Open AutoForge and switch to **AUTOMATE** mode (or click the *Pillar 1 Showcase* shortcut in the left drawer).
2. Prompt: *"Research 10 AI startups, compare their products and pricing, and populate our comparison spreadsheet."*
3. Watch the task planner mint an ArmorIQ intent token, crawl pricing via CDP AX Tree, and trigger the approval modal before writing cells.
4. Observe closed-loop outcome verification (10/10 cells read back and confirmed, enterprise pricing flagged as Unknown).

### 📌 Pillar 2 Showcase: Idea -> Critiqued App -> GTM Video
1. Switch to **BUILD** mode (or click *Pillar 2 Showcase*).
2. Prompt: *"Build a dark-mode developer task manager app, test its UI and API routes, and generate a launch promo video."*
3. Compare the **Before** (generic boilerplate) vs **After** (polished AutoForge UI) tabs.
4. Switch to **CREATE** mode to review the generated marketing script, ElevenLabs voiceover, and composited launch promo video.

### 📌 Security Check: Injection Attack Test
1. Click the red **Injection Attack Test** button on the bottom left.
2. Observe ArmorIQ intercepting and halting the destructive `delete_database` command with fail-closed logs.
