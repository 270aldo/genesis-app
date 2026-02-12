"""Input/output guardrails for the GENESIS agent system.

Validates user input (blocks injection attempts, empty messages, oversized input)
and sanitizes agent output (removes internal agent identity leaks).
"""

import re
from dataclasses import dataclass

# ---------------------------------------------------------------------------
# Input validation
# ---------------------------------------------------------------------------

_INJECTION_PATTERNS = re.compile(
    r"(?i)"
    r"(?:ignore previous instructions"
    r"|you are now"
    r"|<\s*system\s*>"
    r"|forget your instructions"
    r"|override system"
    r"|disregard previous"
    r"|act as (?:a |an )?(?:different|new) (?:ai|assistant|agent)"
    r"|jailbreak"
    r"|DAN mode)"
)

MAX_MESSAGE_LENGTH = 2000


@dataclass
class GuardrailResult:
    allowed: bool
    reason: str = ""


def validate_input(message: str) -> GuardrailResult:
    """Validate a user message before routing to agents.

    Blocks empty messages, oversized messages, and injection attempts.
    """
    if not message or not message.strip():
        return GuardrailResult(allowed=False, reason="Message cannot be empty")

    if len(message) > MAX_MESSAGE_LENGTH:
        return GuardrailResult(
            allowed=False,
            reason=f"Message too long ({len(message)} chars, max {MAX_MESSAGE_LENGTH})",
        )

    if _INJECTION_PATTERNS.search(message):
        return GuardrailResult(allowed=False, reason="Message contains disallowed content")

    return GuardrailResult(allowed=True)


# ---------------------------------------------------------------------------
# Output sanitization
# ---------------------------------------------------------------------------

_AGENT_LEAK_PATTERNS = [
    (re.compile(r"(?i)soy el agente \w+"), "soy GENESIS"),
    (re.compile(r"(?i)te transfiero al agente \w+"), ""),
    (re.compile(r"(?i)sub-agentes? especializados?"), "capacidades especializadas"),
    (re.compile(r"(?i)sistema multi-?agent\w*"), "sistema de coaching"),
    (re.compile(r"(?i)agente (?:train|fuel|mind|track|vision|coach_bridge)"), "GENESIS"),
    (re.compile(r"(?i)delegando? (?:al|a) (?:agente|especialista) \w+"), ""),
]


def validate_output(response: str) -> str:
    """Sanitize agent response text to remove internal identity leaks.

    Preserves valid GENESIS identity mentions.
    """
    if not response:
        return response

    cleaned = response
    for pattern, replacement in _AGENT_LEAK_PATTERNS:
        cleaned = pattern.sub(replacement, cleaned)

    # Clean up whitespace artifacts from removals
    cleaned = re.sub(r"  +", " ", cleaned)
    cleaned = re.sub(r"\n{3,}", "\n\n", cleaned)
    return cleaned.strip()
