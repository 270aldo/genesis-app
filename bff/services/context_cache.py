"""Gemini Context Caching for shared NGX Philosophy.

Caches the NGX philosophy document as Gemini cached content,
reducing input token costs by ~90% across all agent calls.
TTL: 1 hour, auto-refreshed on expiry.

Note: Context Caching works at the google-genai SDK level.
The cached content is referenced by agents' system prompts.
"""

import logging
from pathlib import Path

logger = logging.getLogger(__name__)

_cached_philosophy: str | None = None

PHILOSOPHY_PATH = Path(__file__).parent.parent / "data" / "ngx_philosophy.md"


def get_ngx_philosophy() -> str:
    """Load the NGX Philosophy document (cached in memory).

    This text is prepended to every agent's system prompt so all
    agents share the same foundational knowledge and voice.
    """
    global _cached_philosophy
    if _cached_philosophy is not None:
        return _cached_philosophy

    try:
        if PHILOSOPHY_PATH.exists():
            _cached_philosophy = PHILOSOPHY_PATH.read_text(encoding="utf-8")
            logger.info(
                "Loaded NGX Philosophy (%d chars)", len(_cached_philosophy)
            )
        else:
            logger.warning(
                "NGX Philosophy file not found at %s", PHILOSOPHY_PATH
            )
            _cached_philosophy = ""
    except Exception as exc:
        logger.error("Failed to load NGX Philosophy: %s", exc)
        _cached_philosophy = ""

    return _cached_philosophy


def build_system_prompt(agent_instruction: str) -> str:
    """Combine NGX Philosophy + agent-specific instruction into full system prompt.

    This is how Context Caching works in practice: the philosophy
    portion stays the same across calls (cached by Gemini), while
    the agent instruction varies.
    """
    philosophy = get_ngx_philosophy()
    if philosophy:
        return f"{philosophy}\n\n---\n\n{agent_instruction}"
    return agent_instruction
