"""Knowledge retrieval tools using Gemini File Search API.

Each agent domain has its own File Search Store. The tool queries
the appropriate store based on the domain parameter.

File Search Stores must be created separately via manage_stores.py script.
Until stores are created, the tool returns a graceful fallback message.
"""

import os
import logging

from google import genai
from google.genai import types

logger = logging.getLogger(__name__)

_client: genai.Client | None = None

# Map agent domains to File Search Store resource names.
# These get populated when stores are created via manage_stores.py.
DOMAIN_STORES: dict[str, str] = {
    "genesis": os.getenv("FILESEARCH_STORE_GENESIS", ""),
    "train": os.getenv("FILESEARCH_STORE_TRAIN", ""),
    "fuel": os.getenv("FILESEARCH_STORE_FUEL", ""),
    "mind": os.getenv("FILESEARCH_STORE_MIND", ""),
    "track": os.getenv("FILESEARCH_STORE_TRACK", ""),
}

VALID_DOMAINS = set(DOMAIN_STORES.keys())

SEARCH_MODEL = os.getenv("FILESEARCH_MODEL", "gemini-2.5-flash")


def _get_genai_client() -> genai.Client:
    """Lazy-init genai client."""
    global _client
    if _client is None:
        api_key = os.getenv("GOOGLE_API_KEY", "")
        if api_key:
            _client = genai.Client(api_key=api_key)
        else:
            project = os.getenv("GCP_PROJECT_ID", "")
            location = os.getenv("GCP_LOCATION", "us-central1")
            _client = genai.Client(
                vertexai=True, project=project, location=location
            )
    return _client


def search_knowledge(
    query: str,
    domain: str = "genesis",
    tool_context=None,
) -> dict:
    """Search the knowledge base for a specific domain.

    Args:
        query: The search query (e.g., "periodization principles for hypertrophy").
        domain: Agent domain — one of genesis, train, fuel, mind, track.

    Returns a dict with results text and suggested_widgets.
    """
    if domain not in VALID_DOMAINS:
        return {
            "error": f"Invalid domain '{domain}'. Valid: {', '.join(VALID_DOMAINS)}"
        }

    store_name = DOMAIN_STORES.get(domain, "")
    if not store_name:
        # Store not yet created — return helpful fallback
        return {
            "results": (
                f"Knowledge base for '{domain}' is not yet configured. "
                "Responding based on general training knowledge."
            ),
            "source": "fallback",
            "suggested_widgets": [
                {
                    "type": "insight-card",
                    "title": "Base de Conocimiento",
                    "value": f"Dominio: {domain}",
                    "data": {"status": "not_configured", "query": query[:60]},
                }
            ],
        }

    try:
        client = _get_genai_client()
        response = client.models.generate_content(
            model=SEARCH_MODEL,
            contents=f"Based on the knowledge base, answer: {query}",
            config=types.GenerateContentConfig(
                tools=[
                    types.Tool(
                        file_search=types.FileSearch(
                            file_search_store_names=[store_name],
                        )
                    )
                ],
                temperature=0.3,
            ),
        )

        result_text = response.text or "No relevant information found."

        return {
            "results": result_text,
            "source": "file_search",
            "domain": domain,
            "suggested_widgets": [
                {
                    "type": "insight-card",
                    "title": "Conocimiento GENESIS",
                    "value": query[:60],
                    "data": {"domain": domain, "source": "rag"},
                }
            ],
        }
    except Exception as exc:
        logger.error("File Search query failed (domain=%s): %s", domain, exc)
        return {"error": f"Knowledge search failed: {exc}"}
