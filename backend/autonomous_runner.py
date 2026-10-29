"""
AutoForge Autonomous Task Execution Engine
Natural-Language Request -> Task Planning -> Tool Selection -> Execution -> Postcondition Verification -> Truthful Final Report
Strictly enforces Local Intent Policy Gate approvals, executable browser/code/bench tools,
and transparent distinction between model-backed and deterministic rule-based planning.
"""

import os
import time
import json
import uuid
import asyncio
from typing import List, Dict, Any, Optional, Callable
import httpx
from dotenv import load_dotenv
from pydantic import BaseModel, Field

load_dotenv()

from security import LocalIntentPolicyGate, IntentToken
from verifier import OutcomeVerifier, HTMLMetadataParser
from orchestrator import AntiBoilerplateCouncil
from gtm_pipeline import GTMPipeline

class TaskStep(BaseModel):
    step_id: str
    tool: str
    arguments: Dict[str, Any] = Field(default_factory=dict)
    reasoning: str = ""
    status: str = "PENDING" # 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'SKIPPED'
    result: Optional[Any] = None
    verified: bool = False
    error: Optional[str] = None
    execution_time_ms: float = 0.0

# Alias for backwards compatibility
AutonomousStep = TaskStep

class AutonomousPlanResult(BaseModel):
    plan_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    goal: str
    planner: str
    status: str = "PENDING" # 'PENDING' | 'EXECUTING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'PARTIAL_SUCCESS'
    steps: List[TaskStep]
    overall_outcome: str = ""
    total_time_ms: float = 0.0
    security_tokens: List[IntentToken] = Field(default_factory=list)

class AutonomousRunner:
    """
    Autonomous Execution Engine with constrained executable tool registry and postcondition verification.
    """

    TOOL_REGISTRY = {
        "crawl_and_verify_startups": "Crawls target AI startups, verifies TLS, writes to disk, asserts 100% round-trip parity.",
        "audit_code_with_council": "Runs the 7-reviewer parallel rule-based council on supplied code.",
        "render_gtm_video": "Composites a 1080p video package using FFmpeg and Pillow.",
        "browser_navigate": "Navigates active browser session to target URL and verifies reachability.",
        "browser_capture_ax": "Extracts semantic accessibility tree and interactive nodes from the active CDP session.",
        "http_probe": "Performs an HTTP GET probe to check network reachability and metadata without navigating the GUI browser."
    }

    _active_plans: Dict[str, bool] = {} # plan_id -> is_cancelled
    _browser_bridge_callback: Optional[Callable[[str, Dict[str, Any]], Any]] = None

    @classmethod
    def register_browser_bridge(cls, callback: Callable[[str, Dict[str, Any]], Any]):
        """Registers live Electron browser dispatch callback."""
        cls._browser_bridge_callback = callback

    @classmethod
    def cancel_plan(cls, plan_id: str) -> bool:
        cls._active_plans[plan_id] = True
        return True

    @classmethod
    async def plan_task(cls, goal: str, context: Optional[Dict[str, Any]] = None) -> AutonomousPlanResult:
        """
        Plans structured steps for a user goal.
        Attempts genuine Gemini API call if GEMINI_API_KEY is configured.
        Initializes planner state upfront and handles missing credentials, non-200 responses,
        network errors, malformed JSON, and invalid schemas cleanly.
        Never falsely claims model planning.
        """
        plan_id = str(uuid.uuid4())
        cls._active_plans[plan_id] = False
        goal_clean = goal.strip()
        goal_lower = goal_clean.lower()
        planner_status = "DETERMINISTIC_RULE_BASED_PLANNER"

        gemini_key = os.environ.get("GEMINI_API_KEY")
        if gemini_key:
            try:
                # Attempt real Gemini API call with structured tool selection prompt
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={gemini_key}"
                prompt_text = (
                    f"You are AutoForge autonomous task planner. Decompose this user goal into executable tool steps:\n"
                    f"Goal: '{goal_clean}'\n"
                    f"Available Tools: {json.dumps(cls.TOOL_REGISTRY)}\n"
                    f"Return ONLY a JSON array of step objects with keys: tool, reasoning, arguments."
                )
                payload = {
                    "contents": [{"parts": [{"text": prompt_text}]}],
                    "generationConfig": {"temperature": 0.1, "responseMimeType": "application/json"}
                }
                async with httpx.AsyncClient(timeout=10.0) as client:
                    resp = await client.post(url, json=payload)
                    if resp.status_code == 200:
                        data = resp.json()
                        candidates = data.get("candidates", [])
                        if not candidates:
                            planner_status = "DETERMINISTIC_FALLBACK (Gemini API returned empty candidates)"
                        else:
                            content = candidates[0].get("content", {})
                            parts = content.get("parts", [])
                            if not parts or "text" not in parts[0]:
                                planner_status = "DETERMINISTIC_FALLBACK (Gemini API returned missing text part)"
                            else:
                                text_resp = parts[0]["text"]
                                raw_steps = json.loads(text_resp)
                                if not isinstance(raw_steps, list) or len(raw_steps) == 0:
                                    planner_status = "DETERMINISTIC_FALLBACK (Gemini output is empty or not a JSON list)"
                                else:
                                    steps = []
                                    valid = True
                                    for idx, rs in enumerate(raw_steps, start=1):
                                        if not isinstance(rs, dict):
                                            valid = False
                                            break
                                        tool_name = rs.get("tool")
                                        if tool_name not in cls.TOOL_REGISTRY:
                                            valid = False
                                            break
                                        args = rs.get("arguments", {})
                                        if not isinstance(args, dict):
                                            valid = False
                                            break
                                        # Strict schema validation per tool
                                        if tool_name in ("browser_navigate", "http_probe") and not isinstance(args.get("url"), str):
                                            valid = False
                                            break
                                        steps.append(TaskStep(
                                            step_id=f"step-{idx}",
                                            tool=tool_name,
                                            arguments=args,
                                            reasoning=rs.get("reasoning", "Model-directed execution step.")
                                        ))
                                    if valid and steps:
                                        return AutonomousPlanResult(
                                            plan_id=plan_id,
                                            goal=goal_clean,
                                            planner="GEMINI_MODEL_PLANNER (gemini-2.0-flash)",
                                            status="PENDING",
                                            steps=steps
                                        )
                                    else:
                                        planner_status = "DETERMINISTIC_FALLBACK (Model returned invalid step schema or unknown tools)"
                    else:
                        planner_status = f"DETERMINISTIC_FALLBACK (Gemini API HTTP {resp.status_code})"
            except (httpx.TimeoutException, asyncio.TimeoutError):
                planner_status = "DETERMINISTIC_FALLBACK (Gemini API network timeout)"
            except httpx.RequestError as e:
                planner_status = f"DETERMINISTIC_FALLBACK (Gemini API connection error: {type(e).__name__})"
            except json.JSONDecodeError:
                planner_status = "DETERMINISTIC_FALLBACK (Gemini returned malformed JSON)"
            except Exception as e:
                planner_status = f"DETERMINISTIC_FALLBACK (Gemini planner error: {type(e).__name__})"
        else:
            planner_status = "DETERMINISTIC_RULE_BASED_PLANNER"

        # Deterministic Rule-Based Planner
        steps: List[TaskStep] = []

        # 1. Browser navigation / inspection intent
        if any(w in goal_lower for w in ["browse", "navigate", "open url", "visit", "website", "hackernews", "http"]):
            # Extract URL if present
            url_match = None
            for token in goal_clean.split():
                if token.startswith("http://") or token.startswith("https://"):
                    url_match = token.rstrip(",.")
                    break
            target_url = url_match or "https://news.ycombinator.com"

            steps.append(TaskStep(
                step_id="step-1",
                tool="browser_navigate",
                arguments={"url": target_url},
                reasoning=f"Navigate active Chromium browser session to {target_url} and verify HTTP reachability."
            ))
            steps.append(TaskStep(
                step_id="step-2",
                tool="browser_capture_ax",
                arguments={},
                reasoning="Extract semantic CDP accessibility tree and interactive controls from active page."
            ))

        # 2. Startup matrix verification intent
        elif any(w in goal_lower for w in ["startup", "crawl", "matrix", "verify", "benchmark", "csv"]):
            steps.append(TaskStep(
                step_id="step-1",
                tool="crawl_and_verify_startups",
                arguments={"mode": "LIVE_SCRAPED"},
                reasoning="Crawl top 10 AI startups with standard TLS, extract real metadata, write to disk, and assert byte-level fidelity."
            ))

        # 3. Code audit intent
        elif any(w in goal_lower for w in ["code", "audit", "review", "council", "refactor", "component", "boilerplate"]):
            code_snippet = (context or {}).get("code_snippet") or ""
            use_sample = (context or {}).get("use_sample_fixture", False)

            if not code_snippet and not use_sample:
                # Honestly require source code input rather than silently pretending sample code is user code
                return AutonomousPlanResult(
                    plan_id=plan_id,
                    goal=goal_clean,
                    planner=planner_status,
                    status="FAILED",
                    steps=[],
                    overall_outcome="Planning Halted: Source code was not supplied. Please provide input code or enable the Sample Code Fixture."
                )

            code_to_eval = code_snippet if code_snippet else (
                "// Sample Code Fixture (Demo Input for 7-Reviewer Council)\n"
                "export function LegacyComponent(props: any) {\n"
                "  return <div className=\"bg-slate-900\"><button>Submit</button></div>;\n"
                "}"
            )
            reason_msg = "Evaluate supplied user code against 7-reviewer council." if code_snippet else "Evaluate Sample Code Fixture (Demo Input) against 7-reviewer council."

            steps.append(TaskStep(
                step_id="step-1",
                tool="audit_code_with_council",
                arguments={"code": code_to_eval, "prompt": goal_clean, "is_sample_fixture": not bool(code_snippet)},
                reasoning=reason_msg
            ))

        # 4. Multimodal video intent
        elif any(w in goal_lower for w in ["video", "gtm", "media", "render", "1080p", "campaign"]):
            steps.append(TaskStep(
                step_id="step-1",
                tool="render_gtm_video",
                arguments={"title": "AutoForge Run", "headline": goal_clean[:70]},
                reasoning="Composite 1080p video summary and audio track via Pillow and FFmpeg."
            ))

        # 5. Unrecognized intent - do NOT silently convert to default startup crawl
        else:
            return AutonomousPlanResult(
                plan_id=plan_id,
                goal=goal_clean,
                planner=planner_status,
                status="FAILED",
                steps=[],
                overall_outcome=f"Planning Failed: No matching tools in registry for goal '{goal_clean}'. Available tools: {list(cls.TOOL_REGISTRY.keys())}"
            )

        return AutonomousPlanResult(
            plan_id=plan_id,
            goal=goal_clean,
            planner=planner_status,
            status="PENDING",
            steps=steps
        )

    @classmethod
    async def execute_plan(
        cls,
        plan: AutonomousPlanResult,
        broadcast_callback: Optional[Callable[[Dict[str, Any]], Any]] = None,
        approval_callback: Optional[Callable[[IntentToken], Any]] = None
    ) -> AutonomousPlanResult:
        """
        Executes each planned step sequentially with:
        - Strict Local Intent Policy Gate pre-check
        - Approval pause loop for CONSEQUENTIAL operations (never continues on PENDING_APPROVAL)
        - Tool dispatch with real execution
        - Postcondition verification
        - Accurate cancellation handling
        """
        plan.status = "EXECUTING"
        start_total = time.time()
        tokens: List[IntentToken] = []

        if not plan.steps:
            plan.status = "FAILED"
            if not plan.overall_outcome:
                plan.overall_outcome = "Cannot execute empty plan."
            return plan

        for step in plan.steps:
            # Check for cancellation before starting step
            if cls._active_plans.get(plan.plan_id, False):
                step.status = "SKIPPED"
                step.error = "Execution safely cancelled by user takeover."
                continue

            step.status = "RUNNING"
            step_start = time.time()

            if broadcast_callback:
                await broadcast_callback({
                    "type": "AUTONOMOUS_STEP_START",
                    "data": {"plan_id": plan.plan_id, "step_id": step.step_id, "tool": step.tool}
                })

            # 1. Local Intent Policy Gate Check
            token = LocalIntentPolicyGate.evaluate_intent(
                action=step.tool,
                target=f"tool_execution:{step.step_id}",
                subtasks=[str(step.arguments)]
            )
            tokens.append(token)

            # Fail-closed interception on DESTRUCTIVE
            if token.status == "TASK_BLOCKED":
                step.status = "FAILED"
                step.error = token.reason
                step.verified = False
                step.execution_time_ms = round((time.time() - step_start) * 1000, 2)
                plan.status = "FAILED"
                plan.overall_outcome = f"Halted by Local Intent Policy Gate: {token.reason}"
                break

            # Handle PENDING_APPROVAL on CONSEQUENTIAL actions: NEVER continue automatically!
            if token.status == "PENDING_APPROVAL":
                # 1. Validate intent token signature before requesting approval
                if not LocalIntentPolicyGate.verify_token_signature(token):
                    step.status = "FAILED"
                    step.error = f"Execution halted: Intent token signature validation failed for action '{step.tool}'."
                    step.verified = False
                    plan.status = "FAILED"
                    plan.overall_outcome = step.error
                    break

                if approval_callback is not None:
                    try:
                        # 2. Wait for human approval decision
                        decision = await approval_callback(token)
                        if decision != "APPROVED":
                            step.status = "FAILED"
                            step.error = f"Execution halted: Consequential action '{step.tool}' was rejected by user."
                            step.verified = False
                            plan.status = "FAILED"
                            plan.overall_outcome = step.error
                            break

                        # 3. Consume token & 4. Confirm token consumption succeeded
                        consumed = LocalIntentPolicyGate.consume_token(token)
                        if not consumed:
                            step.status = "FAILED"
                            step.error = f"Execution halted: Intent token consumption failed (already consumed or invalid signature) for action '{step.tool}'."
                            step.verified = False
                            plan.status = "FAILED"
                            plan.overall_outcome = step.error
                            break

                    except Exception as e:
                        step.status = "FAILED"
                        step.error = f"Approval process failed or timed out: {str(e)}"
                        step.verified = False
                        plan.status = "FAILED"
                        plan.overall_outcome = step.error
                        break
                else:
                    # No approval handler registered -> MUST HALT execution
                    step.status = "FAILED"
                    step.error = f"Execution halted: Consequential action '{step.tool}' requires human approval signature, but no approval handler was active."
                    step.verified = False
                    plan.status = "FAILED"
                    plan.overall_outcome = step.error
                    break

            # 2. Tool Dispatch
            try:
                if step.tool == "crawl_and_verify_startups":
                    mode = step.arguments.get("mode", "LIVE_SCRAPED")
                    outcome = await OutcomeVerifier.run_benchmark(mode)
                    step.result = outcome.model_dump()
                    step.verified = (outcome.disk_integrity_verified is True)
                    step.status = "COMPLETED" if step.verified else "FAILED"

                elif step.tool == "audit_code_with_council":
                    code = step.arguments.get("code", "")
                    prompt = step.arguments.get("prompt", "")
                    if not code:
                        step.status = "FAILED"
                        step.error = "No source code provided for council audit."
                        step.verified = False
                    else:
                        verdict = await AntiBoilerplateCouncil.evaluate_code(code, prompt)
                        step.result = verdict.model_dump()
                        step.verified = (len(verdict.critics) == 7 and verdict.average_score >= 0)
                        step.status = "COMPLETED" if step.verified else "FAILED"

                elif step.tool == "render_gtm_video":
                    title = step.arguments.get("title", "AutoForge Run")
                    headline = step.arguments.get("headline", "Autonomous Outcome Verified")
                    gtm_res = await GTMPipeline.composite_gtm_video(title=title, headline=headline)
                    step.result = gtm_res
                    step.verified = (gtm_res.get("success") is True and gtm_res.get("returncode") == 0)
                    step.status = "COMPLETED" if step.verified else "FAILED"

                elif step.tool == "browser_navigate":
                    url = step.arguments.get("url", "https://news.ycombinator.com")
                    if cls._browser_bridge_callback:
                        nav_res = await cls._browser_bridge_callback("navigate", {"url": url})
                        if isinstance(nav_res, dict) and nav_res.get("error") == "BROWSER_BRIDGE_UNAVAILABLE":
                            step.status = "FAILED"
                            step.error = f"BROWSER_BRIDGE_UNAVAILABLE: No active Electron browser bridge connected to navigate to {url}."
                            step.verified = False
                            step.result = nav_res
                        else:
                            success = bool(nav_res.get("success", False)) if isinstance(nav_res, dict) else False
                            step.result = nav_res
                            step.verified = success
                            step.status = "COMPLETED" if success else "FAILED"
                            if not success:
                                step.error = nav_res.get("error", f"Navigation to {url} failed or timed out.") if isinstance(nav_res, dict) else "Navigation failed."
                    else:
                        step.status = "FAILED"
                        step.error = f"BROWSER_BRIDGE_UNAVAILABLE: No live browser bridge registered to navigate to {url}."
                        step.verified = False
                        step.result = {"error": "BROWSER_BRIDGE_UNAVAILABLE", "url": url}

                elif step.tool == "browser_capture_ax":
                    if cls._browser_bridge_callback:
                        ax_res = await cls._browser_bridge_callback("capture_ax", {})
                        if isinstance(ax_res, dict) and ax_res.get("error") == "BROWSER_BRIDGE_UNAVAILABLE":
                            step.status = "FAILED"
                            step.error = "BROWSER_BRIDGE_UNAVAILABLE: No active Electron browser bridge connected to perform live CDP accessibility capture."
                            step.verified = False
                            step.result = ax_res
                        else:
                            nodes = ax_res.get("nodes", ax_res if isinstance(ax_res, list) else [])
                            is_valid = bool(isinstance(nodes, list) and (len(nodes) > 0 or ax_res.get("success", False)))
                            step.result = {
                                "nodes": nodes,
                                "count": len(nodes),
                                "mode": "LIVE_CDP_ACCESSIBILITY"
                            }
                            step.verified = is_valid
                            step.status = "COMPLETED" if is_valid else "FAILED"
                            if not is_valid:
                                step.error = ax_res.get("error", "Live CDP accessibility capture returned no nodes or invalid tree.") if isinstance(ax_res, dict) else "Invalid AX tree."
                    else:
                        step.status = "FAILED"
                        step.error = "BROWSER_BRIDGE_UNAVAILABLE: No live browser bridge registered or connected to perform CDP accessibility capture."
                        step.verified = False
                        step.result = {"error": "BROWSER_BRIDGE_UNAVAILABLE"}

                elif step.tool == "http_probe":
                    url = step.arguments.get("url", "https://news.ycombinator.com")
                    async with httpx.AsyncClient(verify=True, timeout=8.0, follow_redirects=True) as client:
                        resp = await client.get(url)
                        parser = HTMLMetadataParser()
                        parser.feed(resp.text[:60000])
                        step.result = {
                            "url": url,
                            "final_url": str(resp.url),
                            "status_code": resp.status_code,
                            "page_title": parser.title or "TITLE_NOT_FOUND",
                            "mode": "LIVE_HTTP_PROBE"
                        }
                        step.verified = bool(resp.status_code < 400)
                        step.status = "COMPLETED" if step.verified else "FAILED"

                else:
                    step.status = "FAILED"
                    step.error = f"Unsupported tool: {step.tool}"
                    step.verified = False

            except Exception as e:
                step.status = "FAILED"
                step.error = f"{type(e).__name__}: {str(e)}"
                step.verified = False

            step.execution_time_ms = round((time.time() - step_start) * 1000, 2)

            if broadcast_callback:
                await broadcast_callback({
                    "type": "AUTONOMOUS_STEP_COMPLETE",
                    "data": {
                        "plan_id": plan.plan_id,
                        "step_id": step.step_id,
                        "status": step.status,
                        "verified": step.verified,
                        "time_ms": step.execution_time_ms
                    }
                })

            if step.status == "FAILED":
                plan.status = "FAILED"
                plan.overall_outcome = f"Step {step.step_id} ({step.tool}) failed: {step.error}"
                break

        total_elapsed = round((time.time() - start_total) * 1000, 2)
        plan.total_time_ms = total_elapsed
        plan.security_tokens = tokens

        if plan.status != "FAILED":
            if cls._active_plans.get(plan.plan_id, False):
                plan.status = "CANCELLED"
                plan.overall_outcome = "Execution safely halted by user cancellation."
            else:
                completed = sum(1 for s in plan.steps if s.status == "COMPLETED")
                all_verified = all(s.verified for s in plan.steps if s.status == "COMPLETED")
                plan.status = "COMPLETED" if (all_verified and completed == len(plan.steps)) else "PARTIAL_SUCCESS"
                plan.overall_outcome = f"Plan executed: {completed}/{len(plan.steps)} steps verified in {total_elapsed}ms."

        return plan
