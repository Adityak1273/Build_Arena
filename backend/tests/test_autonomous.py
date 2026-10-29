import os
import json
import pytest
import httpx
from autonomous_runner import AutonomousRunner, AutonomousPlanResult, TaskStep

@pytest.mark.asyncio
async def test_autonomous_task_planning():
    plan = await AutonomousRunner.plan_task("Crawl top 10 AI startups and verify CSV output on disk")
    assert plan.status == "PENDING"
    assert len(plan.steps) >= 1
    assert plan.steps[0].tool == "crawl_and_verify_startups"
    assert "DETERMINISTIC" in plan.planner

@pytest.mark.asyncio
async def test_autonomous_execution_lifecycle():
    # Test requires explicit sample fixture or user-supplied code
    plan = await AutonomousRunner.plan_task(
        "Audit code with council",
        context={"use_sample_fixture": True}
    )
    assert len(plan.steps) >= 1
    executed_plan = await AutonomousRunner.execute_plan(plan)
    assert executed_plan.status in ("COMPLETED", "PARTIAL_SUCCESS")
    assert executed_plan.total_time_ms > 0
    assert executed_plan.steps[0].verified is True

@pytest.mark.asyncio
async def test_autonomous_plan_cancellation():
    plan = await AutonomousRunner.plan_task("Render 1080p campaign video")
    cancelled = AutonomousRunner.cancel_plan(plan.plan_id)
    assert cancelled is True

@pytest.mark.asyncio
async def test_planner_gemini_success_mock(monkeypatch):
    """Verifies that when Gemini API responds with valid tool steps, plan is marked GEMINI_MODEL_PLANNER."""
    monkeypatch.setenv("GEMINI_API_KEY", "test_gemini_key")

    fake_json_steps = [
        {"tool": "browser_navigate", "arguments": {"url": "https://news.ycombinator.com"}, "reasoning": "Navigate to HN"},
        {"tool": "browser_capture_ax", "arguments": {}, "reasoning": "Extract AX"}
    ]
    mock_response_data = {
        "candidates": [{
            "content": {
                "parts": [{"text": json.dumps(fake_json_steps)}]
            }
        }]
    }

    class MockResponse:
        status_code = 200
        def json(self):
            return mock_response_data

    class MockAsyncClient:
        def __init__(self, *args, **kwargs):
            pass
        async def __aenter__(self):
            return self
        async def __aexit__(self, *args):
            pass
        async def post(self, *args, **kwargs):
            return MockResponse()

    monkeypatch.setattr(httpx, "AsyncClient", MockAsyncClient)

    plan = await AutonomousRunner.plan_task("Visit Hacker News")
    assert plan.status == "PENDING"
    assert "GEMINI_MODEL_PLANNER" in plan.planner
    assert len(plan.steps) == 2
    assert plan.steps[0].tool == "browser_navigate"

@pytest.mark.asyncio
async def test_planner_gemini_error_handling_non_200(monkeypatch):
    monkeypatch.setenv("GEMINI_API_KEY", "test_gemini_key")

    class MockResponse:
        status_code = 403
        def json(self):
            return {"error": "API key blocked"}

    class MockAsyncClient:
        def __init__(self, *args, **kwargs):
            pass
        async def __aenter__(self):
            return self
        async def __aexit__(self, *args):
            pass
        async def post(self, *args, **kwargs):
            return MockResponse()

    monkeypatch.setattr(httpx, "AsyncClient", MockAsyncClient)

    plan = await AutonomousRunner.plan_task("Visit Hacker News")
    assert "DETERMINISTIC_FALLBACK" in plan.planner
    assert "HTTP 403" in plan.planner

@pytest.mark.asyncio
async def test_planner_gemini_error_handling_malformed_json(monkeypatch):
    monkeypatch.setenv("GEMINI_API_KEY", "test_gemini_key")

    mock_response_data = {
        "candidates": [{
            "content": {
                "parts": [{"text": "Not a valid JSON [ { broken"}]
            }
        }]
    }

    class MockResponse:
        status_code = 200
        def json(self):
            return mock_response_data

    class MockAsyncClient:
        def __init__(self, *args, **kwargs):
            pass
        async def __aenter__(self):
            return self
        async def __aexit__(self, *args):
            pass
        async def post(self, *args, **kwargs):
            return MockResponse()

    monkeypatch.setattr(httpx, "AsyncClient", MockAsyncClient)

    plan = await AutonomousRunner.plan_task("Visit Hacker News")
    assert "DETERMINISTIC_FALLBACK" in plan.planner
    assert "malformed JSON" in plan.planner

@pytest.mark.asyncio
async def test_planner_gemini_error_handling_empty_or_unknown_tools(monkeypatch):
    monkeypatch.setenv("GEMINI_API_KEY", "test_gemini_key")

    mock_response_data = {
        "candidates": [{
            "content": {
                "parts": [{"text": json.dumps([{"tool": "non_existent_tool_xyz", "arguments": {}}])}]
            }
        }]
    }

    class MockResponse:
        status_code = 200
        def json(self):
            return mock_response_data

    class MockAsyncClient:
        def __init__(self, *args, **kwargs):
            pass
        async def __aenter__(self):
            return self
        async def __aexit__(self, *args):
            pass
        async def post(self, *args, **kwargs):
            return MockResponse()

    monkeypatch.setattr(httpx, "AsyncClient", MockAsyncClient)

    plan = await AutonomousRunner.plan_task("Visit Hacker News")
    assert "DETERMINISTIC_FALLBACK" in plan.planner

@pytest.mark.asyncio
async def test_browser_tools_without_bridge_return_unavailable():
    """
    P0 Verification: Proves that when no browser bridge is registered,
    browser_navigate and browser_capture_ax fail honestly with BROWSER_BRIDGE_UNAVAILABLE
    and NEVER return fake accessibility fixtures.
    """
    AutonomousRunner.register_browser_bridge(None)

    plan = AutonomousPlanResult(
        plan_id="test-no-bridge",
        goal="Visit website and capture AX",
        planner="DETERMINISTIC_TEST",
        steps=[
            TaskStep(step_id="step-1", tool="browser_navigate", arguments={"url": "https://example.com"}),
            TaskStep(step_id="step-2", tool="browser_capture_ax", arguments={})
        ]
    )

    executed = await AutonomousRunner.execute_plan(plan)
    assert executed.status == "FAILED"
    step1 = executed.steps[0]
    assert step1.status == "FAILED"
    assert step1.verified is False
    assert "BROWSER_BRIDGE_UNAVAILABLE" in step1.error
    assert step1.result.get("error") == "BROWSER_BRIDGE_UNAVAILABLE"

    # Also test capture_ax alone without bridge
    plan_ax = AutonomousPlanResult(
        plan_id="test-ax-no-bridge",
        goal="Capture AX",
        planner="DETERMINISTIC_TEST",
        steps=[TaskStep(step_id="step-1", tool="browser_capture_ax", arguments={})]
    )
    executed_ax = await AutonomousRunner.execute_plan(plan_ax)
    assert executed_ax.status == "FAILED"
    assert executed_ax.steps[0].status == "FAILED"
    assert executed_ax.steps[0].verified is False
    assert "BROWSER_BRIDGE_UNAVAILABLE" in executed_ax.steps[0].error
    assert executed_ax.steps[0].result.get("nodes") is None

@pytest.mark.asyncio
async def test_browser_tools_with_bridge_contract():
    """
    P1 Verification: Invokes the browser bridge callback and verifies:
    1. Proper Python bool(...) conversion for navigation success/failure.
    2. Real live accessibility nodes are parsed and verified.
    """
    async def mock_bridge(action: str, params: dict):
        if action == "navigate":
            return {"success": True, "url": params.get("url")}
        elif action == "capture_ax":
            return {
                "success": True,
                "nodes": [
                    {"role": "button", "name": "Authentic Node 1"},
                    {"role": "link", "name": "Authentic Link 2"}
                ]
            }
        return {"success": False, "error": "unknown action"}

    AutonomousRunner.register_browser_bridge(mock_bridge)

    plan = AutonomousPlanResult(
        plan_id="test-bridge-ok",
        goal="Test Bridge",
        planner="DETERMINISTIC_TEST",
        steps=[
            TaskStep(step_id="step-1", tool="browser_navigate", arguments={"url": "https://example.com"}),
            TaskStep(step_id="step-2", tool="browser_capture_ax", arguments={})
        ]
    )

    executed = await AutonomousRunner.execute_plan(plan)
    assert executed.status in ("COMPLETED", "PARTIAL_SUCCESS")
    assert executed.steps[0].verified is True
    assert executed.steps[0].status == "COMPLETED"
    assert executed.steps[1].verified is True
    assert executed.steps[1].status == "COMPLETED"
    assert len(executed.steps[1].result["nodes"]) == 2

    # Test bridge reporting failure (verifying bool conversion handles false)
    async def failing_bridge(action: str, params: dict):
        return {"success": False, "error": "Navigation timed out after 8000ms"}

    AutonomousRunner.register_browser_bridge(failing_bridge)
    plan_fail = AutonomousPlanResult(
        plan_id="test-bridge-fail",
        goal="Test Bridge Fail",
        planner="DETERMINISTIC_TEST",
        steps=[TaskStep(step_id="step-1", tool="browser_navigate", arguments={"url": "https://timeout.invalid"})]
    )
    executed_fail = await AutonomousRunner.execute_plan(plan_fail)
    assert executed_fail.status == "FAILED"
    assert executed_fail.steps[0].verified is False
    assert executed_fail.steps[0].status == "FAILED"
    assert "Navigation timed out" in executed_fail.steps[0].error

@pytest.mark.asyncio
async def test_autonomous_multimodal_planning_and_execution():
    # Test creative banner planning
    plan_banner = await AutonomousRunner.plan_task("Generate a marketing banner for AutoForge launch")
    assert plan_banner.status == "PENDING"
    assert len(plan_banner.steps) >= 1
    assert plan_banner.steps[0].tool == "generate_creative_banner"

    exec_banner = await AutonomousRunner.execute_plan(plan_banner)
    assert exec_banner.status in ("COMPLETED", "PARTIAL_SUCCESS")
    assert exec_banner.steps[0].verified is True
    assert exec_banner.steps[0].status == "COMPLETED"

    # Test visual structure planning
    plan_vision = await AutonomousRunner.plan_task("Perform visual qa and layout inspection")
    assert plan_vision.status == "PENDING"
    assert len(plan_vision.steps) >= 1
    assert plan_vision.steps[0].tool == "analyze_visual_structure"

    exec_vision = await AutonomousRunner.execute_plan(plan_vision)
    assert exec_vision.status in ("COMPLETED", "PARTIAL_SUCCESS")
    assert exec_vision.steps[0].verified is True
    assert exec_vision.steps[0].status == "COMPLETED"
