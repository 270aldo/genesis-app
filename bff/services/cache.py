"""3-level response cache for GENESIS BFF.

L1: In-memory exact-match (cachetools.TTLCache, SHA256, 5min TTL)
L2: Semantic similarity (Supabase pgvector, cosine >= 0.92, 1hr TTL)
L3: Gemini Context Caching (handled at model level, see context_cache.py)
"""

import hashlib
import json
import logging
from typing import Any

from cachetools import TTLCache

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# L1: Exact-match cache
# ---------------------------------------------------------------------------

_L1_MAX_SIZE = 10_000
_L1_TTL_SECONDS = 300  # 5 minutes


class CacheLayer:
    """Three-level response cache."""

    def __init__(
        self, l1_maxsize: int = _L1_MAX_SIZE, l1_ttl: int = _L1_TTL_SECONDS
    ):
        self._l1: TTLCache = TTLCache(maxsize=l1_maxsize, ttl=l1_ttl)
        self._l1_hits = 0
        self._l1_misses = 0
        self._l2_hits = 0
        self._l2_misses = 0

    # -- hashing --

    @staticmethod
    def _hash_request(message: str, user_id: str) -> str:
        """SHA256 hash of (user_id + normalized message)."""
        normalized = message.strip().lower()
        combined = f"{user_id}:{normalized}"
        return hashlib.sha256(combined.encode()).hexdigest()

    # -- L1 operations --

    def get_l1(self, message: str, user_id: str) -> dict[str, Any] | None:
        """Check L1 exact-match cache. Returns cached response dict or None."""
        key = self._hash_request(message, user_id)
        result = self._l1.get(key)
        if result is not None:
            self._l1_hits += 1
            logger.debug("L1 cache HIT for key=%s", key[:12])
        else:
            self._l1_misses += 1
        return result

    def set_l1(
        self, message: str, user_id: str, response: dict[str, Any]
    ) -> None:
        """Store response in L1 cache."""
        key = self._hash_request(message, user_id)
        self._l1[key] = response
        logger.debug("L1 cache SET for key=%s", key[:12])

    # -- L2 operations (Supabase pgvector) --

    def get_l2(
        self,
        embedding: list[float],
        user_id: str,
        threshold: float = 0.92,
    ) -> dict[str, Any] | None:
        """Search L2 semantic cache via Supabase pgvector RPC.

        Returns dict with response_text + response_widgets, or None.
        """
        try:
            from services.supabase import get_supabase

            sb = get_supabase()
            result = sb.rpc(
                "search_similar_responses",
                {
                    "p_query_embedding": embedding,
                    "p_user_id": user_id,
                    "p_threshold": threshold,
                    "p_limit": 1,
                },
            ).execute()

            if result.data and len(result.data) > 0:
                self._l2_hits += 1
                hit = result.data[0]
                logger.info(
                    "L2 cache HIT (similarity=%.3f)", hit.get("similarity", 0)
                )
                return hit
            self._l2_misses += 1
            return None
        except Exception as exc:
            logger.error("L2 cache lookup failed: %s", exc)
            self._l2_misses += 1
            return None

    def set_l2(
        self,
        message: str,
        user_id: str,
        agent_id: str,
        embedding: list[float],
        response_text: str,
        response_widgets: list[dict] | None = None,
    ) -> None:
        """Store response + embedding in L2 semantic cache."""
        try:
            from services.supabase import get_supabase

            sb = get_supabase()
            query_hash = self._hash_request(message, user_id)
            sb.table("response_cache").insert(
                {
                    "user_id": user_id,
                    "agent_id": agent_id,
                    "query_hash": query_hash,
                    "query_text": message,
                    "query_embedding": embedding,
                    "response_text": response_text,
                    "response_widgets": (
                        json.dumps(response_widgets)
                        if response_widgets
                        else None
                    ),
                }
            ).execute()
            logger.debug("L2 cache SET for user=%s", user_id)
        except Exception as exc:
            logger.error("L2 cache store failed: %s", exc)

    # -- stats --

    def get_stats(self) -> dict[str, int]:
        """Return cache hit/miss statistics."""
        return {
            "l1_hits": self._l1_hits,
            "l1_misses": self._l1_misses,
            "l1_size": len(self._l1),
            "l2_hits": self._l2_hits,
            "l2_misses": self._l2_misses,
        }


# Module-level singleton
cache = CacheLayer()
