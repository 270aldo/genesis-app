import os
import asyncio
import logging

from google import genai
from google.genai import types

logger = logging.getLogger(__name__)

_client: genai.Client | None = None

MODEL_ID = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")


# ---------------------------------------------------------------------------
# Custom exceptions
# ---------------------------------------------------------------------------


class GeminiError(Exception):
    """Base exception for Gemini service errors."""


class GeminiUnavailableError(GeminiError):
    """Gemini service is unavailable (503, timeout)."""


class GeminiRateLimitError(GeminiError):
    """Gemini rate limit exceeded (429, quota)."""


class GeminiAuthError(GeminiError):
    """Gemini authentication/authorization error (401, 403)."""


# ---------------------------------------------------------------------------
# Client initialisation
# ---------------------------------------------------------------------------


def _get_client() -> genai.Client:
    """Lazy-initialise the Vertex AI Gemini client."""
    global _client
    if _client is None:
        project = os.getenv("GCP_PROJECT_ID", "")
        location = os.getenv("GCP_LOCATION", "us-central1")
        if not project:
            raise RuntimeError(
                "GCP_PROJECT_ID env var is required for Gemini integration"
            )
        _client = genai.Client(
            vertexai=True,
            project=project,
            location=location,
        )
    return _client


# ---------------------------------------------------------------------------
# Error classification
# ---------------------------------------------------------------------------


def _classify_error(exc: Exception) -> type:
    """Map a raw exception to a specific GeminiError subclass."""
    msg = str(exc).lower()
    if "429" in msg or "rate" in msg or "quota" in msg:
        return GeminiRateLimitError
    if "503" in msg or "unavailable" in msg or "timeout" in msg:
        return GeminiUnavailableError
    if "401" in msg or "403" in msg or "permission" in msg or "auth" in msg:
        return GeminiAuthError
    return GeminiError


# ---------------------------------------------------------------------------
# Retry wrapper
# ---------------------------------------------------------------------------


async def _retry_generate(client, model, contents, config, *, max_retries=2, base_delay=0.5) -> str:
    """Call Gemini with exponential-backoff retries for transient errors."""
    last_exc = None
    for attempt in range(max_retries + 1):
        try:
            response = client.models.generate_content(
                model=model, contents=contents, config=config,
            )
            return response.text or ""
        except Exception as exc:
            error_cls = _classify_error(exc)
            last_exc = error_cls(str(exc))

            if error_cls is GeminiAuthError:
                raise last_exc from exc

            if attempt < max_retries and error_cls in (GeminiRateLimitError, GeminiUnavailableError):
                delay = base_delay * (2 ** attempt)
                logger.warning(
                    "Gemini attempt %d failed (%s), retrying in %.1fs",
                    attempt + 1, error_cls.__name__, delay,
                )
                await asyncio.sleep(delay)
                continue

            raise last_exc from exc
    raise last_exc  # Should not reach here


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------


async def generate_response(
    system_prompt: str,
    user_message: str,
    history: list[dict] | None = None,
) -> str:
    """Send a prompt to Gemini and return the text response.

    Parameters
    ----------
    system_prompt : str
        System-level instruction that defines agent persona and context.
    user_message : str
        The latest user message.
    history : list[dict] | None
        Optional prior conversation turns as
        ``[{"role": "user"|"model", "text": "..."}]``.

    Returns
    -------
    str
        The model's text response.

    Raises
    ------
    GeminiError
        On non-retryable failures or after retries are exhausted.
    """
    client = _get_client()

    # Build contents list from history + current message
    contents: list[types.Content] = []
    if history:
        for turn in history:
            role = turn.get("role", "user")
            text = turn.get("text", "")
            contents.append(
                types.Content(
                    role=role,
                    parts=[types.Part.from_text(text=text)],
                )
            )

    contents.append(
        types.Content(
            role="user",
            parts=[types.Part.from_text(text=user_message)],
        )
    )

    config = types.GenerateContentConfig(
        system_instruction=system_prompt,
        temperature=0.7,
        max_output_tokens=1024,
    )

    result = await _retry_generate(client, MODEL_ID, contents, config)
    if not result:
        logger.warning("Gemini returned empty text response")
    return result
