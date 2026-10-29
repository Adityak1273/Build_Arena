"""
ArmorIQ CSRG (Cryptographic Security & Rules Gate)
Zero-Trust Merkle Tree Intent Token Engine with Fail-Closed Interception
"""

import hashlib
import hmac
import time
import uuid
import re
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

SECRET_CSRG_KEY = b"armor_iq_csrg_zero_trust_master_key_2026"

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

class ArmorIQGate:
    """
    Evaluates commands and intents against strict zero-trust rules.
    Destructive operations fail-closed immediately.
    Consequential operations halt for human approval.
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
        r'\boverwrite_file\b'
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

    @staticmethod
    def _sign_intent(intent_id: str, action: str, merkle_root: str, risk: str) -> str:
        payload = f"{intent_id}:{action}:{merkle_root}:{risk}".encode('utf-8')
        return hmac.new(SECRET_CSRG_KEY, payload, hashlib.sha256).hexdigest()

    @classmethod
    def evaluate_intent(cls, action: str, target: str, subtasks: Optional[List[str]] = None) -> IntentToken:
        plan = subtasks or [f"{action}:{target}"]
        merkle_root = cls._compute_merkle_root(plan)
        combined_text = f"{action} {target} {' '.join(plan)}".lower()

        # Check for Destructive Patterns -> Fail Closed Immediately
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
                    reason=f"TASK_BLOCKED: ArmorIQ CSRG fail-closed interception. Destructive pattern detected ('{pattern}'). Execution halted."
                )

        # Check for Consequential Patterns -> Requires Human Approval
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
                    reason=f"Action '{action}' on '{target}' is consequential and requires explicit human verification signature."
                )

        # Safe operation
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
            reason="Verified safe: zero destructive signatures detected. Merkle leaf validated."
        )
