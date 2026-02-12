"""Embedding generation service using google-genai SDK.

Uses text-embedding-004 (768 dimensions).
Used for L2 semantic cache vectorization.
"""

import os
import logging

from google import genai

logger = logging.getLogger(__name__)

_client: genai.Client | None = None

EMBEDDING_MODEL = "text-embedding-004"
EMBEDDING_DIMENSIONS = 768


def _get_genai_client() -> genai.Client:
    """Lazy-initialise the genai client for embeddings."""
    global _client
    if _client is None:
        api_key = os.getenv("GOOGLE_API_KEY", "")
        if api_key:
            _client = genai.Client(api_key=api_key)
        else:
            # Fall back to Vertex AI auth
            project = os.getenv("GCP_PROJECT_ID", "")
            location = os.getenv("GCP_LOCATION", "us-central1")
            _client = genai.Client(
                vertexai=True, project=project, location=location
            )
    return _client


def generate_embedding(text: str) -> list[float] | None:
    """Generate a 768-dim embedding vector for the given text.

    Returns None on failure (caller should skip L2 cache).
    """
    try:
        client = _get_genai_client()
        response = client.models.embed_content(
            model=EMBEDDING_MODEL,
            contents=text,
        )
        if response.embeddings and len(response.embeddings) > 0:
            return response.embeddings[0].values
        logger.warning("Embedding response empty for text: %s", text[:50])
        return None
    except Exception as exc:
        logger.error("Embedding generation failed: %s", exc)
        return None
