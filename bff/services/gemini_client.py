import os
import logging

from google import genai
from google.genai import types

logger = logging.getLogger(__name__)

_client: genai.Client | None = None

MODEL_ID = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")


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
        The model's text response, or a fallback string on error.
    """
    try:
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

        # Append the current user message
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

        response = client.models.generate_content(
            model=MODEL_ID,
            contents=contents,
            config=config,
        )

        if response.text:
            return response.text

        logger.warning("Gemini returned empty text response")
        return ""

    except Exception:
        logger.exception("Gemini generate_response failed")
        return ""
