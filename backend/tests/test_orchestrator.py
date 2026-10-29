import pytest
from orchestrator import (
    AntiBoilerplateCouncil,
    audit_aesthetics_and_design_tokens,
    audit_idiomatic_syntax,
    audit_security_and_hardening,
    compute_real_diff
)

@pytest.mark.asyncio
async def test_council_seven_critics_concurrency():
    sample_code = """
    export function SampleWidget(props: any) {
      return (
        <div className="bg-slate-900 border border-slate-700 text-slate-100 p-4">
          <button>Submit</button>
        </div>
      );
    }
    """
    verdict = await AntiBoilerplateCouncil.evaluate_code(sample_code, "Audit widget")
    assert len(verdict.critics) == 7
    assert verdict.average_score > 0
    assert verdict.council_mode == "DETERMINISTIC_RULE_BASED_COUNCIL"
    assert verdict.optimized_code is not None

    # Check line numbers detected
    critic_names = [c.critic_name for c in verdict.critics]
    assert "Aesthetics & Design Token Critic" in critic_names
    assert "Idiomatic Syntax Critic" in critic_names
    assert "Security & Hardening Auditor" in critic_names

@pytest.mark.asyncio
async def test_critic_flags_any_and_line_numbers():
    code_with_any = "const x: any = 10;\nconst y: any = 20;"
    feedback = await audit_idiomatic_syntax(code_with_any)
    assert feedback.passed is False
    assert 1 in feedback.line_violations
    assert 2 in feedback.line_violations
    assert feedback.score < 100

@pytest.mark.asyncio
async def test_critic_flags_security_xss():
    code_xss = "<div dangerouslySetInnerHTML={{ __html: userInput }} />"
    feedback = await audit_security_and_hardening(code_xss)
    assert feedback.passed is False
    assert feedback.score <= 40
    assert 1 in feedback.line_violations

def test_compute_real_diff():
    orig = "const a = 1;\nconst b = 2;\n"
    trans = "const a = 1;\nconst b = 99;\n"
    diff = compute_real_diff(orig, trans, "test.ts")
    assert "-const b = 2;" in diff
    assert "+const b = 99;" in diff
