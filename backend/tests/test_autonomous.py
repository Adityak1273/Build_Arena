import pytest
from autonomous_runner import AutonomousRunner

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
