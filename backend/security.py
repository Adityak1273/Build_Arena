"""
AutoForge Local Intent Policy Gate
Zero-Trust Merkle Tree Intent Token Engine with Fail-Closed Interception
Deterministic regex pattern evaluation, HMAC-SHA256 signature verification, and one-time token enforcement.
Note: This is a local cryptographic policy gate, not an external ArmorIQ cloud service.
"""

import os
import secrets
import hashlib
import hmac
import time
import uuid
import re
from typing import List, Dict, Any, Optional, Set
from pydantic import BaseModel, Field

# Secure key initialization: use environment variable or generate cryptographically secure session key
_ENV_KEY = os.environ.get("AUTOFORGE_SECRET_KEY")
if _ENV_KEY:
    SECRET_POLICY_KEY = _ENV_KEY.encode("utf-8")
else:
    # Ephemeral 256-bit secure secret per server process
    SECRET_POLICY_KEY = secrets.token_bytes(32)

# Set of consumed/revoked intent IDs to prevent token replay attacks
_CONSUMED_INTENT_IDS: Set[str] = set()

class IntentToken(BaseModel):
    intent_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    timestamp: float = Field(default_factory=time.time)
    action: str
    target: str
    risk_level: str # 'SAFE' | 'CONSEQUENTIAL' | 'DESTRUCTIVE'
    requires_approval: bool
    merkle_root: str
    signature: str
    status: str # 'AUTHORIZED' | 'PENDING_APPROVAL' | 'TASK_BLOCKED'
    reason: str

class LocalIntentPolicyGate:
    """
    Evaluates commands and intents against deterministic zero-trust security rules.
    - DESTRUCTIVE operations fail-closed immediately (TASK_BLOCKED).
    - CONSEQUENTIAL operations halt and require explicit human-in-the-loop authorization.
    - SAFE operations are signed and permitted.
    """

    DESTRUCTIVE_PATTERNS = [
        r'\brm\s+-rf\b',
        r'\bdrop\s+table\b',
        r'\bdelete\s+from\b',
        r'\bformat\s+[a-z]:\b',
        r'\bcurl\b.*\|\s*sh\b',
        r'\bchmod\s+777\b',
        r'\bexec\s*\(',
        r'\beval\s*\(',
        r'__import__\s*\(',
        r':\s*>\s*/dev/sda',
        r'\bshred\b',
        r'DROP\s+DATABASE',
        r'kill\s+-9\s+1'
    ]

    CONSEQUENTIAL_PATTERNS = [
        r'\bgit\s+push\b',
        r'\bnpm\s+publish\b',
        r'\bdeploy\b',
        r'\bexport\s+AWS_',
        r'\btruncate\b',
        r'\bwrite_disk\b',
        r'\bgenerate_gtm_video\b',
        r'\brender_gtm_video\b',
        r'\boverwrite_file\b',
        r'\bformat_disk\b',
        r'\bdelete_artifact\b'
    ]

    @staticmethod
    def _compute_merkle_root(items: List[str]) -> str:
        if not items:
            return hashlib.sha256(b"empty_plan").hexdigest()
        
        hashes = [hashlib.sha256(item.encode('utf-8')).hexdigest() for item in items]
        while len(hashes) > 1:
            if len(hashes) % 2 != 0:
                hashes.append(hashes[-1])
            new_level = []
            for i in range(0, len(hashes), 2):
                combined = (hashes[i] + hashes[i+1]).encode('utf-8')
                new_level.append(hashlib.sha256(combined).hexdigest())
            hashes = new_level
        return hashes[0]

    @classmethod
    def _sign_intent(cls, intent_id: str, action: str, merkle_root: str, risk: str) -> str:
        payload = f"{intent_id}:{action}:{merkle_root}:{risk}".encode('utf-8')
        return hmac.new(SECRET_POLICY_KEY, payload, hashlib.sha256).hexdigest()

    @classmethod
    def verify_token_signature(cls, token: IntentToken) -> bool:
        """Verifies HMAC signature authenticity and non-tampering."""
        expected_sig = cls._sign_intent(token.intent_id, token.action, token.merkle_root, token.risk_level)
        return hmac.compare_digest(expected_sig, token.signature)

    @classmethod
    def consume_token(cls, token: IntentToken) -> bool:
        """
        Marks an intent token as consumed so it cannot be re-used for replay.
        Returns True if consumed successfully, False if already consumed or invalid.
        """
        if token.intent_id in _CONSUMED_INTENT_IDS:
            return False
        if not cls.verify_token_signature(token):
            return False
        _CONSUMED_INTENT_IDS.add(token.intent_id)
        return True

    @classmethod
    def is_token_consumed(cls, intent_id: str) -> bool:
        return intent_id in _CONSUMED_INTENT_IDS

    @classmethod
    def evaluate_intent(cls, action: str, target: str, subtasks: Optional[List[str]] = None) -> IntentToken:
        plan = subtasks or [f"{action}:{target}"]
        merkle_root = cls._compute_merkle_root(plan)
        combined_text = f"{action} {target} {' '.join(plan)}".lower()

        # 1. Check for Destructive Patterns -> Fail Closed Immediately
        for pattern in cls.DESTRUCTIVE_PATTERNS:
            if re.search(pattern, combined_text, re.IGNORECASE):
                intent_id = str(uuid.uuid4())
                sig = cls._sign_intent(intent_id, action, merkle_root, "DESTRUCTIVE")
                return IntentToken(
                    intent_id=intent_id,
                    action=action,
                    target=target,
                    risk_level="DESTRUCTIVE",
                    requires_approval=False,
                    merkle_root=merkle_root,
                    signature=sig,
                    status="TASK_BLOCKED",
                    reason=f"TASK_BLOCKED: Local Intent Policy Gate fail-closed interception. Destructive pattern detected ('{pattern}'). Execution halted."
                )

        # 2. Check for Consequential Patterns -> Requires Human Approval
        for pattern in cls.CONSEQUENTIAL_PATTERNS:
            if re.search(pattern, combined_text, re.IGNORECASE):
                intent_id = str(uuid.uuid4())
                sig = cls._sign_intent(intent_id, action, merkle_root, "CONSEQUENTIAL")
                return IntentToken(
                    intent_id=intent_id,
                    action=action,
                    target=target,
                    risk_level="CONSEQUENTIAL",
                    requires_approval=True,
                    merkle_root=merkle_root,
                    signature=sig,
                    status="PENDING_APPROVAL",
                    reason=f"Action '{action}' on target '{target}' is consequential and requires explicit human verification signature."
                )

        # 3. Safe operations are authorized
        intent_id = str(uuid.uuid4())
        sig = cls._sign_intent(intent_id, action, merkle_root, "SAFE")
        return IntentToken(
            intent_id=intent_id,
            action=action,
            target=target,
            risk_level="SAFE",
            requires_approval=False,
            merkle_root=merkle_root,
            signature=sig,
            status="AUTHORIZED",
            reason="Verified safe operation by Local Intent Policy Gate rules."
        )

# Backward compatibility alias
ArmorIQGate = LocalIntentPolicyGate
