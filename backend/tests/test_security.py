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
