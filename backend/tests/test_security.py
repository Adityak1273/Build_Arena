import pytest
from security import LocalIntentPolicyGate, IntentToken

def test_safe_intent_authorized():
    token = LocalIntentPolicyGate.evaluate_intent(
        action="read_file",
        target="data.txt",
        subtasks=["Inspect contents"]
    )
    assert token.status == "AUTHORIZED"
    assert token.risk_level == "SAFE"
    assert token.requires_approval is False
    assert LocalIntentPolicyGate.verify_token_signature(token) is True

def test_destructive_intent_blocked():
    token = LocalIntentPolicyGate.evaluate_intent(
        action="execute_shell",
        target="filesystem",
        subtasks=["rm -rf / --no-preserve-root"]
    )
    assert token.status == "TASK_BLOCKED"
    assert token.risk_level == "DESTRUCTIVE"
    assert "fail-closed" in token.reason.lower()

def test_consequential_intent_requires_approval():
    token = LocalIntentPolicyGate.evaluate_intent(
        action="deploy",
        target="production_cluster",
        subtasks=["git push origin main"]
    )
    assert token.status == "PENDING_APPROVAL"
    assert token.risk_level == "CONSEQUENTIAL"
    assert token.requires_approval is True

def test_token_consumption_prevents_replay():
    token = LocalIntentPolicyGate.evaluate_intent(
        action="read_config",
        target="config.json"
    )
    assert LocalIntentPolicyGate.is_token_consumed(token.intent_id) is False
    # First consume succeeds
    consumed = LocalIntentPolicyGate.consume_token(token)
    assert consumed is True
    assert LocalIntentPolicyGate.is_token_consumed(token.intent_id) is True
    # Second consume must fail (replay rejected)
    consumed_again = LocalIntentPolicyGate.consume_token(token)
    assert consumed_again is False

def test_tampered_token_signature_rejected():
    token = LocalIntentPolicyGate.evaluate_intent(
        action="read_config",
        target="config.json"
    )
    # Alter token payload
    tampered_token = token.model_copy(update={"action": "rm -rf /"})
    assert LocalIntentPolicyGate.verify_token_signature(tampered_token) is False

@pytest.mark.asyncio
async def test_consequential_execution_halted_without_approval_callback():
    from autonomous_runner import AutonomousRunner, AutonomousPlanResult, AutonomousStep
    plan = AutonomousPlanResult(
        plan_id="test-plan-halt",
        goal="Render campaign video",
        planner="DETERMINISTIC_TEST",
        steps=[
            AutonomousStep(
                step_id="step-1",
                reasoning="Composite video",
                tool="render_gtm_video",
                arguments={"title": "Test Video"}
            )
        ]
    )
    executed = await AutonomousRunner.execute_plan(plan, approval_callback=None)
    assert executed.status == "FAILED"
    assert executed.steps[0].status == "FAILED"
    assert "requires human approval signature" in executed.steps[0].error
    assert executed.steps[0].verified is False

@pytest.mark.asyncio
async def test_consequential_execution_rejected_by_user():
    from autonomous_runner import AutonomousRunner, AutonomousPlanResult, AutonomousStep
    plan = AutonomousPlanResult(
        plan_id="test-plan-reject",
        goal="Render campaign video",
        planner="DETERMINISTIC_TEST",
        steps=[
            AutonomousStep(
                step_id="step-1",
                reasoning="Composite video",
                tool="render_gtm_video",
                arguments={"title": "Test Video"}
            )
        ]
    )
    async def reject_callback(token):
        return "REJECTED"

    executed = await AutonomousRunner.execute_plan(plan, approval_callback=reject_callback)
    assert executed.status == "FAILED"
    assert executed.steps[0].status == "FAILED"
    assert "was rejected by user" in executed.steps[0].error

@pytest.mark.asyncio
async def test_consequential_execution_timeout():
    import asyncio
    from autonomous_runner import AutonomousRunner, AutonomousPlanResult, AutonomousStep
    plan = AutonomousPlanResult(
        plan_id="test-plan-timeout",
        goal="Render campaign video",
        planner="DETERMINISTIC_TEST",
        steps=[
            AutonomousStep(
                step_id="step-1",
                reasoning="Composite video",
                tool="render_gtm_video",
                arguments={"title": "Test Video"}
            )
        ]
    )
    async def timeout_callback(token):
        raise asyncio.TimeoutError("Approval timed out after 30s")

    executed = await AutonomousRunner.execute_plan(plan, approval_callback=timeout_callback)
    assert executed.status == "FAILED"
    assert executed.steps[0].status == "FAILED"
    assert "timed out" in executed.steps[0].error

@pytest.mark.asyncio
async def test_consequential_execution_approved():
    from autonomous_runner import AutonomousRunner, AutonomousPlanResult, AutonomousStep
    plan = AutonomousPlanResult(
        plan_id="test-plan-approved",
        goal="Render campaign video",
        planner="DETERMINISTIC_TEST",
        steps=[
            AutonomousStep(
                step_id="step-1",
                reasoning="Composite video",
                tool="render_gtm_video",
                arguments={"title": "Test Video", "frame_count": 2}
            )
        ]
    )
    async def approve_callback(token):
        return "APPROVED"

    executed = await AutonomousRunner.execute_plan(plan, approval_callback=approve_callback)
    assert executed.status in ("COMPLETED", "PARTIAL_SUCCESS")
    assert executed.steps[0].status == "COMPLETED"
    assert executed.steps[0].verified is True
