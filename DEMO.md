# AutoForge v1.5 — 3-Minute Live Hackathon Demo Script

**Track**: AI-Native Browser with an Autonomous Multimodal Companion Using AdaL  
**Demo Duration**: Exactly 3 Minutes (180 Seconds)  
**Presenter**: Lead Engineer / Founder  

---

## ⏱️ Minute 0:00 - 0:45 | The Problem & Architectural Paradigm

### Speaker Pitch:
> "Judges, modern AI browsers are either passive chat sidebars that read static DOM text, or opaque black-box agents that hallucinate outputs and guess coordinates. When an agent touches your production data or browses the web, you need two things: **Hardware-level observable ground truth** and **Independent cryptographic outcome verification**."

### Live Action on Screen:
1. Launch AutoForge (`npm start`). Show the sleek Obsidian glassmorphic interface.
2. Click **Browse Mode**: Show the live Chromium session connected via **CDP (Chrome DevTools Protocol)**.
3. Click **Capture AX Tree**: Highlight the authentic semantic hierarchy (`role`, `accessible name`, `backend DOM node ID`).
4. Point out the real-time **CDP round-trip ping latency** in the status bar:
   > "AutoForge doesn't simulate browsing. It drives genuine Chromium via CDP 1.3 hardware events and inspects accessibility trees directly."

---

## ⏱️ Minute 0:45 - 2:00 | The Flagship Capability Orchestration

### Speaker Pitch:
> "Now let's see our flagship multi-capability workflow: **Research 10 AI startups, compare product and pricing, write to a physical spreadsheet, and generate an authentic high-resolution launch visual**."

### Live Action on Screen:
1. Switch to **Automate Mode**.
2. Point to the Goal bar pre-filled with:  
   `"Research 10 AI startups, compare product and pricing, write to spreadsheet, create a launch image"`
3. Click **Generate Plan**:
   - Show the **AdaL Adaptive Planner** decomposing the goal into 6 discrete, verifiable steps:
     1. `browser_navigate`: Navigate to target AI startup homepage (`elevenlabs.io`).
     2. `browser_extract`: Extract live DOM text to verify capabilities.
     3. `benchmark_export`: Concurrent TLS scrape of 10 seed AI startups with honest pricing classification.
     4. `verify_artifact`: OutcomeVerifier assertion of physical CSV row count (>=10) and SHA-256 hash.
     5. `multimodal_launch`: Playwright Chromium rendering of 1280x720 launch poster (>20KB) & 1080p MP4 package.
     6. `verify_launch_artifact`: Read-back assertion of generated PNG file size and binary header.
4. Click **Execute Plan**:
   - Watch the step cards transition from **Pending** → **Running** → **Verified**.
   - Expand Step 4: Show the **OutcomeVerifier** assertion report.
   - Expand Step 5: Show the Playwright render output.
   - Point out the **Honest Reporting Policy** in the table:
     > "Notice Supabase and Suno: Because their pricing requires enterprise contact or dynamic interaction, AutoForge honestly marks them as `UNKNOWN (Enterprise Contact Required)` instead of fabricating fake pricing data. Every data point has a clickable source URL evidence link."
5. Click **Side-by-Side** button:
   - Left side: Live browser viewport snapshot.
   - Right side: Generated 1280x720 launch poster (`hero_frame.png`, 408KB) and MP4 video.
6. Click **Inline Edit**:
   - Change a table cell (e.g. modify ElevenLabs tier).
   - Notice the **Unsaved Edits Detected** badge pulsing in amber.
   - Click **Save & Re-Verify (SHA-256)**:
   - Point to the toast notification:  
     `Disk Artifact Re-Verified: New SHA-256 Hash is <hash>`  
     > "The spreadsheet on physical disk was re-read and its SHA-256 checksum was cryptographically recalculated in real-time."

---

## ⏱️ Minute 2:00 - 2:45 | Zero-Trust Safety & Human-in-the-Loop Control

### Speaker Pitch:
> "Autonomous power without security is a liability. AutoForge implements **VIGIL**, a zero-trust policy engine."

### Live Action on Screen:
1. Show **Approval Modal**:
   - Trigger or demonstrate a consequential action (such as `publish_gtm_campaign` or deleting data).
   - An intentional pop-up appears:
     - Merkle root HMAC-SHA256 signed token.
     - Action description and risk level (`CONSEQUENTIAL`).
     - Three buttons: **Emergency Cancel**, **Manual Takeover**, and **Approve & Execute**.
2. Click **Manual Takeover**:
   - Show the agent immediately pausing execution loop mid-task.
   - The user inspects or modifies state.
   - Click **Resume Takeover**: The agent resumes cleanly from the exact step.
3. Switch to **Build Mode**:
   - Paste a quick TypeScript snippet with `: any` or raw `innerHTML`.
   - Click **Run 7-Critic Council Review**:
   - 7 parallel AST critics return with line-by-line violation flags, unified diffs, and an average score.

---

## ⏱️ Minute 2:45 - 3:00 | Task History Memory & Closing

### Speaker Pitch:
> "Finally, user-controlled memory."

### Live Action on Screen:
1. In **Automate Mode**, click **Task History**:
   - Show the history drawer listing the execution we just ran:
     - Task ID, Start Time, Execution Duration (e.g. 1,420 ms).
     - Verified steps ratio (6/6 Verified).
     - Direct clickable links to the generated CSV, PNG, and MP4 artifacts.
   - Point out **Clear Memory**: User has full sovereignty to wipe the history store with one click.
2. Closing statement:
   > "AutoForge is not a simulation. It is a real Playwright + Electron browser runtime, with closed-loop outcome verification, honest unknown reporting, zero-trust policy gates, and multimodal AdaL orchestration. All 8 automated test suites pass 100%. Thank you!"

---

## 🛠️ Quick Verification Commands for Judges

```bash
# 1. Run complete 8/8 automated runtime test suite
npm run test:runtime

# 2. Verify TypeScript type-safety & Vite build
npx tsc --noEmit && npm run build

# 3. Inspect generated physical artifacts on disk
ls -l artifacts/
# Notice:
# artifacts/ai_startups_comparison.csv (verified row count & headers)
# artifacts/hero_frame.png (>400 KB authentic 1280x720 PNG)
# artifacts/launch_video.mp4 (playable 1280x720 MP4)
# artifacts/task_history.json (persistent audit trail)
```
