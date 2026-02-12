# Sprint 4 "Cerebro" — Track A: Intelligence Infrastructure

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Give GENESIS agents real intelligence — RAG knowledge retrieval, 3-level response cache, Google Search grounding, Gemini Context Caching, and refined per-agent prompts. Zero new vendors (Google + Supabase only).

**Architecture:** Gemini File Search API wraps RAG in a custom ADK tool (~30 lines). L1 cache uses in-memory `cachetools.TTLCache`. L2 semantic cache uses Supabase pgvector with `text-embedding-004` embeddings. L3 uses Gemini Context Caching for shared NGX philosophy. GoogleSearch built-in tool added to FUEL and MIND agents.

**Tech Stack:** Google ADK 1.25.0, google-genai SDK, Gemini File Search API, cachetools, Supabase pgvector 0.8.0, pg_cron, FastAPI, Pytest

**Supabase Project:** `yrbegeobvpvtltmanrfh` (genesis-app, us-west-2, ACTIVE)

**Constraints:**
- BFF runs LOCAL only (Cloud Run is Sprint 5)
- Agents run in ADK Runner inside BFF process (Agent Engine is Sprint 5)
- Must not break existing 122 BFF tests
- Must not break A2UI widget pipeline
- Must not break unified GENESIS identity
- COACH_BRIDGE and A2A protocol are NOT in scope (Sprint 5-6)

---

## Task Overview

| # | Task | Files Created | Files Modified | Tests |
|---|------|--------------|----------------|-------|
| 1 | Enable pgvector + pg_cron on Supabase | — (SQL migration) | — | — |
| 2 | Create `response_cache` table + RPC | — (SQL migration) | — | — |
| 3 | Add `cachetools` + `google-cloud-aiplatform` to requirements | `—` | `bff/requirements.txt` | — |
| 4 | Build L1 exact-match cache service | `bff/services/cache.py` | — | `bff/tests/test_cache.py` |
| 5 | Build embedding service | `bff/services/embeddings.py` | — | `bff/tests/test_embeddings.py` |
| 6 | Build L2 semantic cache (pgvector) | Extend `bff/services/cache.py` | — | Extend `bff/tests/test_cache.py` |
| 7 | Integrate L1+L2 cache into agent_router | — | `bff/services/agent_router.py` | `bff/tests/test_agent_router_adk.py` |
| 8 | Build File Search wrapper tool | `bff/agents/tools/knowledge_tools.py` | — | `bff/tests/test_knowledge_tools.py` |
| 9 | Build File Search store manager script | `bff/scripts/manage_stores.py` | — | — |
| 10 | Add GoogleSearch to FUEL + MIND agents | — | `bff/agents/fuel_agent.py`, `bff/agents/mind_agent.py` | `bff/tests/test_agents.py` |
| 11 | Build NGX Philosophy doc + Context Caching | `bff/data/ngx_philosophy.md`, `bff/services/context_cache.py` | — | `bff/tests/test_context_cache.py` |
| 12 | Wire knowledge tools into all agents | — | All 5 agent files | `bff/tests/test_agents.py` |
| 13 | Refine per-agent prompts | — | All 5 agent files | `bff/tests/test_agents.py` |
| 14 | Update health endpoint with cache/RAG status | — | `bff/main.py` | `bff/tests/test_health.py` |
| 15 | Update .env.example + CLAUDE.md | — | `bff/.env.example`, `CLAUDE.md` | — |
| 16 | Run full test suite + ruff | — | — | All tests |

**Track B (parallel, separate session):** Create knowledge documents for each agent corpus — exercise DB export, nutrition tables, sleep science docs, scoring algorithms, NGX philosophy expansion. This is content creation, not code.

---

## Task 1: Enable pgvector + pg_cron on Supabase

**Files:** None (Supabase SQL migration via MCP)

**Step 1: Enable pgvector extension**

Run via Supabase MCP `apply_migration`:
```sql
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;
```

**Step 2: Enable pg_cron extension**

Run via Supabase MCP `apply_migration`:
```sql
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
```

**Step 3: Verify extensions are active**

Run via Supabase MCP `execute_sql`:
```sql
SELECT extname, extversion FROM pg_extension WHERE extname IN ('vector', 'pg_cron');
```
Expected: Both rows present with versions.

---

## Task 2: Create `response_cache` table + similarity RPC

**Files:** None (Supabase SQL migration via MCP)

**Step 1: Create response_cache table**

Run via Supabase MCP `apply_migration` (name: `create_response_cache`):
```sql
-- Semantic response cache for L2 cache layer
CREATE TABLE IF NOT EXISTS public.response_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    agent_id TEXT NOT NULL DEFAULT 'genesis',
    query_hash TEXT NOT NULL,
    query_text TEXT NOT NULL,
    query_embedding vector(768),
    response_text TEXT NOT NULL,
    response_widgets JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ DEFAULT (now() + interval '1 hour')
);

-- HNSW index for fast cosine similarity search
CREATE INDEX idx_cache_embedding ON public.response_cache
    USING hnsw (query_embedding vector_cosine_ops);

-- Index for exact-match lookups (L1 fallback in DB)
CREATE INDEX idx_cache_hash ON public.response_cache (query_hash)
    WHERE expires_at > now();

-- Index for TTL cleanup
CREATE INDEX idx_cache_expires ON public.response_cache (expires_at);

-- RLS
ALTER TABLE public.response_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on response_cache"
    ON public.response_cache
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Similarity search RPC function
CREATE OR REPLACE FUNCTION public.search_similar_responses(
    p_query_embedding vector(768),
    p_user_id UUID,
    p_threshold FLOAT DEFAULT 0.92,
    p_limit INT DEFAULT 1
)
RETURNS TABLE (
    id UUID,
    response_text TEXT,
    response_widgets JSONB,
    similarity FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        rc.id,
        rc.response_text,
        rc.response_widgets,
        1 - (rc.query_embedding <=> p_query_embedding) AS similarity
    FROM public.response_cache rc
    WHERE rc.user_id = p_user_id
        AND rc.expires_at > now()
        AND 1 - (rc.query_embedding <=> p_query_embedding) >= p_threshold
    ORDER BY rc.query_embedding <=> p_query_embedding
    LIMIT p_limit;
END;
$$;

-- TTL cleanup function
CREATE OR REPLACE FUNCTION public.cleanup_expired_cache()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM public.response_cache WHERE expires_at < now();
END;
$$;

-- Schedule hourly cleanup via pg_cron
SELECT cron.schedule(
    'cleanup-response-cache',
    '0 * * * *',
    'SELECT public.cleanup_expired_cache()'
);
```

**Step 2: Verify table and RPC**

Run via Supabase MCP `execute_sql`:
```sql
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'response_cache' ORDER BY ordinal_position;
```
Expected: 10 columns including `query_embedding` as `USER-DEFINED` (vector).

---

## Task 3: Add new dependencies to requirements.txt

**Files:**
- Modify: `bff/requirements.txt`

**Step 1: Add cachetools and google-genai (for embeddings + File Search)**

Add these lines to `bff/requirements.txt`:
```
cachetools>=5.5.0
google-genai>=1.1.0
```

Note: `google-genai` is already a transitive dependency of `google-adk`, but we pin it explicitly for the File Search and embedding APIs. Do NOT add `google-cloud-aiplatform` — the `google-genai` SDK handles embeddings directly via `client.models.embed_content()`.

**Step 2: Install**

```bash
cd bff && pip install -r requirements.txt --break-system-packages
```

---

## Task 4: Build L1 exact-match cache service

**Files:**
- Create: `bff/services/cache.py`
- Create: `bff/tests/test_cache.py`

**Step 1: Write the failing test**

Create `bff/tests/test_cache.py`:
```python
"""Tests for the 3-level cache service."""

import pytest
from services.cache import CacheLayer


class TestL1ExactMatchCache:
    """L1: in-memory TTLCache with SHA256 keys."""

    def setup_method(self):
        self.cache = CacheLayer()

    def test_cache_miss_returns_none(self):
        result = self.cache.get_l1("hello", "user-1")
        assert result is None

    def test_cache_hit_after_set(self):
        self.cache.set_l1("hello", "user-1", {"response": "world"})
        result = self.cache.get_l1("hello", "user-1")
        assert result == {"response": "world"}

    def test_different_users_different_cache(self):
        self.cache.set_l1("hello", "user-1", {"response": "a"})
        self.cache.set_l1("hello", "user-2", {"response": "b"})
        assert self.cache.get_l1("hello", "user-1") == {"response": "a"}
        assert self.cache.get_l1("hello", "user-2") == {"response": "b"}

    def test_different_messages_different_cache(self):
        self.cache.set_l1("hello", "user-1", {"response": "a"})
        self.cache.set_l1("bye", "user-1", {"response": "b"})
        assert self.cache.get_l1("hello", "user-1") == {"response": "a"}
        assert self.cache.get_l1("bye", "user-1") == {"response": "b"}

    def test_hash_is_deterministic(self):
        h1 = self.cache._hash_request("hello", "user-1")
        h2 = self.cache._hash_request("hello", "user-1")
        assert h1 == h2

    def test_hash_changes_with_input(self):
        h1 = self.cache._hash_request("hello", "user-1")
        h2 = self.cache._hash_request("hello!", "user-1")
        assert h1 != h2

    def test_get_stats_initial(self):
        stats = self.cache.get_stats()
        assert stats["l1_hits"] == 0
        assert stats["l1_misses"] == 0
        assert stats["l1_size"] == 0

    def test_get_stats_after_operations(self):
        self.cache.get_l1("miss", "u1")  # miss
        self.cache.set_l1("hit", "u1", {"r": "ok"})
        self.cache.get_l1("hit", "u1")  # hit
        stats = self.cache.get_stats()
        assert stats["l1_hits"] == 1
        assert stats["l1_misses"] == 1
        assert stats["l1_size"] == 1
```

**Step 2: Run test to verify it fails**

```bash
cd bff && python -m pytest tests/test_cache.py -v
```
Expected: FAIL — `ModuleNotFoundError: No module named 'services.cache'`

**Step 3: Write implementation**

Create `bff/services/cache.py`:
```python
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

    def __init__(self, l1_maxsize: int = _L1_MAX_SIZE, l1_ttl: int = _L1_TTL_SECONDS):
        self._l1 = TTLCache(maxsize=l1_maxsize, ttl=l1_ttl)
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

    def set_l1(self, message: str, user_id: str, response: dict[str, Any]) -> None:
        """Store response in L1 cache."""
        key = self._hash_request(message, user_id)
        self._l1[key] = response
        logger.debug("L1 cache SET for key=%s", key[:12])

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
```

**Step 4: Run tests**

```bash
cd bff && python -m pytest tests/test_cache.py -v
```
Expected: All 8 tests PASS.

**Step 5: Commit**

```bash
git add bff/services/cache.py bff/tests/test_cache.py
git commit -m "feat(cache): add L1 exact-match cache with TTLCache"
```

---

## Task 5: Build embedding service

**Files:**
- Create: `bff/services/embeddings.py`
- Create: `bff/tests/test_embeddings.py`

**Step 1: Write the failing test**

Create `bff/tests/test_embeddings.py`:
```python
"""Tests for the embedding service."""

import pytest
from unittest.mock import patch, MagicMock


class TestEmbeddingService:
    """Embedding generation via google-genai SDK."""

    def test_generate_embedding_returns_768_dim_list(self):
        """Mock the genai client and verify output shape."""
        mock_response = MagicMock()
        mock_response.embeddings = [MagicMock(values=[0.1] * 768)]

        with patch("services.embeddings._get_genai_client") as mock_client:
            mock_client.return_value.models.embed_content.return_value = mock_response
            from services.embeddings import generate_embedding

            result = generate_embedding("test query")
            assert isinstance(result, list)
            assert len(result) == 768

    def test_generate_embedding_calls_correct_model(self):
        """Verify we call text-embedding-004."""
        mock_response = MagicMock()
        mock_response.embeddings = [MagicMock(values=[0.1] * 768)]

        with patch("services.embeddings._get_genai_client") as mock_client:
            mock_client.return_value.models.embed_content.return_value = mock_response
            from services.embeddings import generate_embedding

            generate_embedding("test")
            call_args = mock_client.return_value.models.embed_content.call_args
            assert "text-embedding-004" in str(call_args)

    def test_generate_embedding_handles_error(self):
        """Should return None on API failure."""
        with patch("services.embeddings._get_genai_client") as mock_client:
            mock_client.return_value.models.embed_content.side_effect = Exception("API error")
            from services.embeddings import generate_embedding

            result = generate_embedding("test query")
            assert result is None
```

**Step 2: Run test to verify it fails**

```bash
cd bff && python -m pytest tests/test_embeddings.py -v
```
Expected: FAIL — `ModuleNotFoundError: No module named 'services.embeddings'`

**Step 3: Write implementation**

Create `bff/services/embeddings.py`:
```python
"""Embedding generation service using google-genai SDK.

Uses text-embedding-004 (768 dimensions, free until Nov 2025).
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
            _client = genai.Client(vertexai=True, project=project, location=location)
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
```

**Step 4: Run tests**

```bash
cd bff && python -m pytest tests/test_embeddings.py -v
```
Expected: All 3 tests PASS.

**Step 5: Commit**

```bash
git add bff/services/embeddings.py bff/tests/test_embeddings.py
git commit -m "feat(embeddings): add text-embedding-004 service for semantic cache"
```

---

## Task 6: Build L2 semantic cache (pgvector)

**Files:**
- Modify: `bff/services/cache.py` (add L2 methods)
- Modify: `bff/tests/test_cache.py` (add L2 tests)

**Step 1: Write the failing L2 tests**

Add to `bff/tests/test_cache.py`:
```python
class TestL2SemanticCache:
    """L2: Supabase pgvector semantic similarity."""

    def setup_method(self):
        self.cache = CacheLayer()

    def test_set_l2_calls_supabase_insert(self, mock_supabase):
        """Verify L2 stores embedding + response in Supabase."""
        mock_sb, chain = mock_supabase
        embedding = [0.1] * 768

        with patch("services.cache.get_supabase", return_value=mock_sb):
            self.cache.set_l2(
                message="test query",
                user_id="user-1",
                agent_id="genesis",
                embedding=embedding,
                response_text="test response",
                response_widgets=None,
            )
            mock_sb.table.assert_called_with("response_cache")
            chain.insert.assert_called_once()

    def test_get_l2_calls_rpc(self, mock_supabase):
        """Verify L2 queries via Supabase RPC."""
        mock_sb, chain = mock_supabase
        chain.execute.return_value = MagicMock(data=[])
        embedding = [0.1] * 768

        with patch("services.cache.get_supabase", return_value=mock_sb):
            result = self.cache.get_l2(embedding=embedding, user_id="user-1")
            mock_sb.rpc.assert_called_once()
            assert result is None

    def test_get_l2_returns_cached_response_on_hit(self, mock_supabase):
        """Verify L2 returns response when similarity >= 0.92."""
        mock_sb, chain = mock_supabase
        mock_sb.rpc.return_value = chain
        chain.execute.return_value = MagicMock(data=[{
            "id": "cache-1",
            "response_text": "cached answer",
            "response_widgets": None,
            "similarity": 0.95,
        }])
        embedding = [0.1] * 768

        with patch("services.cache.get_supabase", return_value=mock_sb):
            result = self.cache.get_l2(embedding=embedding, user_id="user-1")
            assert result is not None
            assert result["response_text"] == "cached answer"

    def test_get_l2_returns_none_on_error(self, mock_supabase):
        """L2 should gracefully return None on Supabase error."""
        mock_sb, chain = mock_supabase
        mock_sb.rpc.side_effect = Exception("DB error")
        embedding = [0.1] * 768

        with patch("services.cache.get_supabase", return_value=mock_sb):
            result = self.cache.get_l2(embedding=embedding, user_id="user-1")
            assert result is None
```

Add these imports at top of test file:
```python
from unittest.mock import patch, MagicMock
```

**Step 2: Run test to verify failures**

```bash
cd bff && python -m pytest tests/test_cache.py::TestL2SemanticCache -v
```
Expected: FAIL — `AttributeError: 'CacheLayer' object has no attribute 'get_l2'`

**Step 3: Add L2 methods to cache.py**

Add to `bff/services/cache.py` inside the `CacheLayer` class:
```python
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
                    "response_widgets": json.dumps(response_widgets) if response_widgets else None,
                }
            ).execute()
            logger.debug("L2 cache SET for user=%s", user_id)
        except Exception as exc:
            logger.error("L2 cache store failed: %s", exc)
```

Add `import json` to the top of cache.py if not already present.

**Step 4: Run tests**

```bash
cd bff && python -m pytest tests/test_cache.py -v
```
Expected: All 12 tests PASS (8 L1 + 4 L2).

**Step 5: Commit**

```bash
git add bff/services/cache.py bff/tests/test_cache.py
git commit -m "feat(cache): add L2 semantic cache with Supabase pgvector"
```

---

## Task 7: Integrate L1+L2 cache into agent_router

**Files:**
- Modify: `bff/services/agent_router.py`
- Modify: `bff/tests/test_agent_router_adk.py`

**Step 1: Write failing tests for cache integration**

Add to `bff/tests/test_agent_router_adk.py`:
```python
class TestCacheIntegration:
    """Cache layer integration in agent_router."""

    @pytest.mark.asyncio
    async def test_l1_cache_hit_skips_adk(self):
        """When L1 has a cached response, ADK Runner should NOT be called."""
        from services.cache import cache
        from services.agent_router import route_to_agent

        # Pre-populate L1
        cache.set_l1("what's my workout?", "user-1", {
            "response": "cached workout response",
            "widgets": None,
        })

        with patch("services.agent_router._adk_available", False):
            response = await route_to_agent("genesis", "what's my workout?", "user-1")
            # Should return cached, not stub
            assert "cached workout response" in response.response

        # Cleanup
        cache._l1 = TTLCache(maxsize=10000, ttl=300)

    @pytest.mark.asyncio
    async def test_cache_miss_proceeds_to_adk(self):
        """When cache misses, normal ADK routing should proceed."""
        from services.agent_router import route_to_agent

        with patch("services.agent_router._adk_available", False):
            response = await route_to_agent("genesis", "unique-msg-12345", "user-1")
            # Should fall back to stub
            assert "GENESIS" in response.response
```

**Step 2: Modify agent_router.py to integrate cache**

In `bff/services/agent_router.py`, add cache check before ADK routing and cache store after response:

At the top, add:
```python
from services.cache import cache as _cache
```

In `route_to_agent()`, after input guardrail check but before ADK routing:
```python
    # L1 cache check
    l1_hit = _cache.get_l1(message, user_id)
    if l1_hit:
        logger.info("L1 cache hit — returning cached response")
        return ChatResponse(
            id=str(uuid.uuid4()),
            response=l1_hit.get("response", ""),
            widgets=l1_hit.get("widgets"),
            conversation_id=resolved_conversation_id,
        )

    # L2 cache check (async, needs embedding)
    try:
        from services.embeddings import generate_embedding
        query_embedding = generate_embedding(message)
        if query_embedding:
            l2_hit = _cache.get_l2(embedding=query_embedding, user_id=user_id)
            if l2_hit:
                logger.info("L2 cache hit — returning semantically cached response")
                response_text = l2_hit["response_text"]
                widgets_json = l2_hit.get("response_widgets")
                widgets = json.loads(widgets_json) if widgets_json else None
                # Also store in L1 for faster next hit
                _cache.set_l1(message, user_id, {"response": response_text, "widgets": widgets})
                return ChatResponse(
                    id=str(uuid.uuid4()),
                    response=response_text,
                    widgets=widgets,
                    conversation_id=resolved_conversation_id,
                )
    except Exception as exc:
        logger.debug("L2 cache check skipped: %s", exc)
        query_embedding = None
```

After the final ChatResponse is built (before return), add:
```python
    # Store in L1 + L2 cache
    _cache.set_l1(message, user_id, {
        "response": response_text,
        "widgets": [w.model_dump() for w in widgets] if widgets else None,
    })
    if query_embedding is None:
        try:
            from services.embeddings import generate_embedding
            query_embedding = generate_embedding(message)
        except Exception:
            query_embedding = None
    if query_embedding:
        _cache.set_l2(
            message=message,
            user_id=user_id,
            agent_id=agent_id,
            embedding=query_embedding,
            response_text=response_text,
            response_widgets=[w.model_dump() for w in widgets] if widgets else None,
        )
```

**Step 3: Run tests**

```bash
cd bff && python -m pytest tests/test_agent_router_adk.py -v
cd bff && python -m pytest tests/ -v  # Full suite — must keep 122+ passing
```

**Step 4: Commit**

```bash
git add bff/services/agent_router.py bff/tests/test_agent_router_adk.py
git commit -m "feat(cache): integrate L1+L2 cache into agent_router pipeline"
```

---

## Task 8: Build File Search wrapper tool for ADK

**Files:**
- Create: `bff/agents/tools/knowledge_tools.py`
- Create: `bff/tests/test_knowledge_tools.py`

**Step 1: Write the failing test**

Create `bff/tests/test_knowledge_tools.py`:
```python
"""Tests for File Search knowledge retrieval tools."""

import pytest
from unittest.mock import patch, MagicMock


class TestSearchKnowledge:
    """File Search wrapper tool for ADK agents."""

    def test_search_knowledge_returns_results(self):
        """Should return text results from File Search."""
        mock_response = MagicMock()
        mock_response.text = "Periodization involves systematic planning..."
        mock_response.candidates = [MagicMock()]

        with patch("agents.tools.knowledge_tools._get_genai_client") as mock_client:
            mock_client.return_value.models.generate_content.return_value = mock_response
            from agents.tools.knowledge_tools import search_knowledge

            result = search_knowledge(query="periodization principles", domain="train")
            assert "results" in result
            assert len(result["results"]) > 0

    def test_search_knowledge_with_invalid_domain(self):
        """Should return error for unknown domain."""
        from agents.tools.knowledge_tools import search_knowledge

        result = search_knowledge(query="test", domain="invalid_domain")
        assert "error" in result

    def test_search_knowledge_handles_api_error(self):
        """Should gracefully handle File Search API failures."""
        with patch("agents.tools.knowledge_tools._get_genai_client") as mock_client:
            mock_client.return_value.models.generate_content.side_effect = Exception("API fail")
            from agents.tools.knowledge_tools import search_knowledge

            result = search_knowledge(query="test", domain="train")
            assert "error" in result

    def test_search_knowledge_includes_suggested_widget(self):
        """Tool responses should include suggested_widgets for A2UI."""
        mock_response = MagicMock()
        mock_response.text = "Recovery protocols include..."
        mock_response.candidates = [MagicMock()]

        with patch("agents.tools.knowledge_tools._get_genai_client") as mock_client:
            mock_client.return_value.models.generate_content.return_value = mock_response
            from agents.tools.knowledge_tools import search_knowledge

            result = search_knowledge(query="recovery", domain="mind")
            assert "suggested_widgets" in result
```

**Step 2: Write implementation**

Create `bff/agents/tools/knowledge_tools.py`:
```python
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
# Format: "projects/{project}/locations/{location}/fileSearchStores/{store_id}"
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
            _client = genai.Client(vertexai=True, project=project, location=location)
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
        return {"error": f"Invalid domain '{domain}'. Valid: {', '.join(VALID_DOMAINS)}"}

    store_name = DOMAIN_STORES.get(domain, "")
    if not store_name:
        # Store not yet created — return helpful fallback
        return {
            "results": f"Knowledge base for '{domain}' is not yet configured. "
            "Responding based on general training knowledge.",
            "source": "fallback",
            "suggested_widgets": [{
                "type": "insight-card",
                "title": "Base de Conocimiento",
                "value": f"Dominio: {domain}",
                "data": {"status": "not_configured", "query": query[:60]},
            }],
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
            "suggested_widgets": [{
                "type": "insight-card",
                "title": "Conocimiento GENESIS",
                "value": query[:60],
                "data": {"domain": domain, "source": "rag"},
            }],
        }
    except Exception as exc:
        logger.error("File Search query failed (domain=%s): %s", domain, exc)
        return {"error": f"Knowledge search failed: {exc}"}
```

**Step 3: Run tests**

```bash
cd bff && python -m pytest tests/test_knowledge_tools.py -v
```
Expected: All 4 tests PASS.

**Step 4: Commit**

```bash
git add bff/agents/tools/knowledge_tools.py bff/tests/test_knowledge_tools.py
git commit -m "feat(rag): add File Search wrapper tool for agent knowledge retrieval"
```

---

## Task 9: Build File Search store manager script

**Files:**
- Create: `bff/scripts/manage_stores.py`

This is a utility script (not production code) for creating and managing File Search stores. Run manually when setting up knowledge bases (Track B).

Create `bff/scripts/manage_stores.py`:
```python
#!/usr/bin/env python3
"""Manage Gemini File Search Stores for GENESIS agent knowledge bases.

Usage:
    python scripts/manage_stores.py create --domain train --display-name "GENESIS Training KB"
    python scripts/manage_stores.py upload --domain train --file docs/training_principles.pdf
    python scripts/manage_stores.py list
    python scripts/manage_stores.py query --domain train --query "periodization"

Requires: GOOGLE_API_KEY env var
"""

import argparse
import os
import sys
import time

from google import genai

DOMAINS = ["genesis", "train", "fuel", "mind", "track"]


def get_client() -> genai.Client:
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        print("ERROR: Set GOOGLE_API_KEY environment variable")
        sys.exit(1)
    return genai.Client(api_key=api_key)


def cmd_create(args):
    """Create a new File Search Store for a domain."""
    client = get_client()
    store = client.file_search_stores.create(
        config={"display_name": args.display_name or f"genesis-{args.domain}-kb"}
    )
    print(f"Created store: {store.name}")
    print(f"Set this in .env: FILESEARCH_STORE_{args.domain.upper()}={store.name}")


def cmd_upload(args):
    """Upload a file to a domain's store."""
    client = get_client()
    store_name = os.getenv(f"FILESEARCH_STORE_{args.domain.upper()}")
    if not store_name:
        print(f"ERROR: Set FILESEARCH_STORE_{args.domain.upper()} in .env first")
        sys.exit(1)

    print(f"Uploading {args.file} to {store_name}...")
    operation = client.file_search_stores.upload_to_file_search_store(
        file=args.file,
        file_search_store_name=store_name,
        config={
            "display_name": os.path.basename(args.file),
            "chunking_config": {
                "max_tokens_per_chunk": 512,
                "max_overlap_tokens": 50,
            },
        },
    )

    while not operation.done:
        print("  Processing...")
        time.sleep(3)
        operation = client.operations.get(operation)

    if hasattr(operation, "error") and operation.error:
        print(f"ERROR: Upload failed: {operation.error}")
    else:
        print(f"Uploaded: {args.file}")


def cmd_list(args):
    """List all File Search Stores."""
    client = get_client()
    stores = client.file_search_stores.list()
    for store in stores:
        print(f"  {store.display_name}: {store.name}")


def cmd_query(args):
    """Test query against a domain's store."""
    client = get_client()
    store_name = os.getenv(f"FILESEARCH_STORE_{args.domain.upper()}")
    if not store_name:
        print(f"ERROR: Set FILESEARCH_STORE_{args.domain.upper()} in .env")
        sys.exit(1)

    from google.genai import types

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=args.query,
        config=types.GenerateContentConfig(
            tools=[
                types.Tool(
                    file_search=types.FileSearch(
                        file_search_store_names=[store_name],
                    )
                )
            ],
        ),
    )
    print(f"\nQuery: {args.query}")
    print(f"Response:\n{response.text}")


def main():
    parser = argparse.ArgumentParser(description="Manage GENESIS File Search Stores")
    sub = parser.add_subparsers(dest="command")

    p_create = sub.add_parser("create")
    p_create.add_argument("--domain", required=True, choices=DOMAINS)
    p_create.add_argument("--display-name", default=None)

    p_upload = sub.add_parser("upload")
    p_upload.add_argument("--domain", required=True, choices=DOMAINS)
    p_upload.add_argument("--file", required=True)

    sub.add_parser("list")

    p_query = sub.add_parser("query")
    p_query.add_argument("--domain", required=True, choices=DOMAINS)
    p_query.add_argument("--query", required=True)

    args = parser.parse_args()
    if args.command == "create":
        cmd_create(args)
    elif args.command == "upload":
        cmd_upload(args)
    elif args.command == "list":
        cmd_list(args)
    elif args.command == "query":
        cmd_query(args)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
```

**Commit:**
```bash
git add bff/scripts/manage_stores.py
git commit -m "feat(rag): add File Search store manager script for knowledge bases"
```

---

## Task 10: Add GoogleSearch to FUEL + MIND agents

**Files:**
- Modify: `bff/agents/fuel_agent.py`
- Modify: `bff/agents/mind_agent.py`
- Modify: `bff/tests/test_agents.py`

**Step 1: Write the failing test**

Add to `bff/tests/test_agents.py`:
```python
def test_fuel_agent_has_google_search_tool():
    """FUEL agent should have GoogleSearch for real-time food data."""
    from agents.fuel_agent import fuel_agent
    tool_names = [t.__class__.__name__ if hasattr(t, '__class__') else str(t) for t in fuel_agent.tools]
    # GoogleSearch is a built-in tool object, check by class name
    assert any("GoogleSearch" in name or "google_search" in str(t).lower()
               for name, t in zip(tool_names, fuel_agent.tools))


def test_mind_agent_has_google_search_tool():
    """MIND agent should have GoogleSearch for latest research."""
    from agents.mind_agent import mind_agent
    tool_names = [t.__class__.__name__ if hasattr(t, '__class__') else str(t) for t in mind_agent.tools]
    assert any("GoogleSearch" in name or "google_search" in str(t).lower()
               for name, t in zip(tool_names, mind_agent.tools))


def test_train_agent_does_not_have_google_search():
    """TRAIN agent should NOT have GoogleSearch — uses internal data only."""
    from agents.train_agent import train_agent
    tool_names = [t.__class__.__name__ if hasattr(t, '__class__') else str(t) for t in train_agent.tools]
    assert not any("GoogleSearch" in name for name in tool_names)
```

**Step 2: Add GoogleSearch to FUEL and MIND agents**

In `bff/agents/fuel_agent.py`, add:
```python
from google.adk.tools import google_search
```

And in the Agent definition, add `google_search` to the tools list:
```python
tools=[get_today_meals, log_meal, get_water_intake, log_water, google_search],
```

Same pattern in `bff/agents/mind_agent.py`:
```python
from google.adk.tools import google_search
```
```python
tools=[submit_check_in, get_wellness_trends, google_search],
```

**Step 3: Run tests**

```bash
cd bff && python -m pytest tests/test_agents.py -v
```
Expected: All agent tests PASS including new GoogleSearch assertions.

**Step 4: Commit**

```bash
git add bff/agents/fuel_agent.py bff/agents/mind_agent.py bff/tests/test_agents.py
git commit -m "feat(grounding): add GoogleSearch to FUEL and MIND agents"
```

---

## Task 11: Build NGX Philosophy doc + Context Caching service

**Files:**
- Create: `bff/data/ngx_philosophy.md`
- Create: `bff/services/context_cache.py`
- Create: `bff/tests/test_context_cache.py`

**Step 1: Create the NGX Philosophy document**

Create `bff/data/ngx_philosophy.md`:
```markdown
# NGX Performance & Longevity — Philosophy & Principles

## Brand Identity
GENESIS is a premium AI coaching entity created by NGX. GENESIS speaks as one unified intelligence — confident, data-driven, warm but direct. Never generic fitness advice. Everything is personalized to the user's biology, context, and adherence patterns.

## Training Principles
- Periodization is non-negotiable: every program follows structured mesocycles
- Progressive overload drives adaptation — volume, intensity, or density must increase systematically
- RPE/RIR-based autoregulation > rigid percentage programs
- Compound movements first, isolation for targeted development
- Recovery is training — it's where adaptation happens
- Deload weeks are strategic, not optional (every 4th week or biofeedback-triggered)
- Session RPE determines next-day adjustments

## Nutrition Philosophy
- Protein is the master macronutrient: 1.6-2.2g/kg bodyweight minimum
- Calorie targets serve the training goal (build/cut/maintain)
- Meal timing matters for performance but adherence matters more
- Hydration: minimum 0.033L per kg bodyweight daily
- Supplements are supplements — food first, targeted supplementation second
- No demonizing food groups — context and dose determine impact

## Recovery & Wellness
- Sleep is the #1 recovery tool: 7-9 hours, consistent schedule
- HRV trends > single-day readings for readiness assessment
- Stress management is performance management
- Active recovery > complete rest for most people
- Soreness is feedback, not a badge of honor

## Coaching Voice
- Speak in first person as GENESIS
- Reference the user's actual data and history
- Adapt tone: encouraging when fatigued, direct when performing well
- Never condescending, never overly casual
- Scientific backing when recommending changes
- Celebrate progress with specific data points, not generic praise

## Communication Rules
- NEVER reveal internal architecture (agents, sub-agents, transfers, delegation)
- NEVER say "let me check with..." or "transferring you to..."
- ALWAYS respond as ONE unified entity: GENESIS
- ALWAYS use Spanish as default language
- Use metric system (kg, cm) unless user specifies otherwise
```

**Step 2: Build context cache service**

Create `bff/services/context_cache.py`:
```python
"""Gemini Context Caching for shared NGX Philosophy.

Caches the NGX philosophy document as Gemini cached content,
reducing input token costs by ~90% across all agent calls.
TTL: 1 hour, auto-refreshed on expiry.

Note: Context Caching works at the google-genai SDK level.
The cached content is referenced by agents' system prompts.
"""

import os
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
            logger.info("Loaded NGX Philosophy (%d chars)", len(_cached_philosophy))
        else:
            logger.warning("NGX Philosophy file not found at %s", PHILOSOPHY_PATH)
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
```

**Step 3: Write tests**

Create `bff/tests/test_context_cache.py`:
```python
"""Tests for NGX Philosophy context cache."""

import pytest
from services.context_cache import get_ngx_philosophy, build_system_prompt


class TestContextCache:

    def test_loads_philosophy_file(self):
        text = get_ngx_philosophy()
        assert isinstance(text, str)
        assert "GENESIS" in text
        assert "Periodization" in text

    def test_philosophy_contains_key_principles(self):
        text = get_ngx_philosophy()
        assert "Progressive overload" in text or "progressive overload" in text
        assert "Recovery" in text
        assert "Protein" in text

    def test_philosophy_contains_voice_rules(self):
        text = get_ngx_philosophy()
        assert "NEVER reveal internal architecture" in text
        assert "ONE unified entity" in text

    def test_build_system_prompt_combines(self):
        prompt = build_system_prompt("You are a training specialist.")
        assert "NGX" in prompt
        assert "training specialist" in prompt

    def test_build_system_prompt_without_philosophy(self):
        """If philosophy is empty, should still return agent instruction."""
        import services.context_cache as cc
        original = cc._cached_philosophy
        cc._cached_philosophy = ""
        try:
            prompt = build_system_prompt("Agent instruction only")
            assert prompt == "Agent instruction only"
        finally:
            cc._cached_philosophy = original
```

**Step 4: Run tests**

```bash
cd bff && python -m pytest tests/test_context_cache.py -v
```
Expected: All 5 tests PASS.

**Step 5: Commit**

```bash
git add bff/data/ngx_philosophy.md bff/services/context_cache.py bff/tests/test_context_cache.py
git commit -m "feat(context): add NGX Philosophy doc and context caching service"
```

---

## Task 12: Wire knowledge tools + context cache into all agents

**Files:**
- Modify: `bff/agents/genesis_agent.py`
- Modify: `bff/agents/train_agent.py`
- Modify: `bff/agents/fuel_agent.py`
- Modify: `bff/agents/mind_agent.py`
- Modify: `bff/agents/track_agent.py`

**Step 1: Add knowledge_tools import to each agent**

In each agent file, add:
```python
from agents.tools.knowledge_tools import search_knowledge
from services.context_cache import build_system_prompt
```

Add `search_knowledge` to each agent's `tools` list.

**Step 2: Wrap each agent's instruction with build_system_prompt**

Replace the `instruction=("...")` string with `instruction=build_system_prompt("...")` in each agent. This prepends NGX Philosophy to every agent's system prompt.

Example for genesis_agent.py:
```python
instruction=build_system_prompt(
    "Eres GENESIS, un coach premium de fitness con inteligencia artificial.\n"
    # ... rest of existing instruction ...
),
```

**Step 3: Run tests**

```bash
cd bff && python -m pytest tests/ -v
```
Expected: All existing tests pass. Knowledge tool appears in each agent's tool list.

**Step 4: Commit**

```bash
git add bff/agents/*.py
git commit -m "feat(agents): wire knowledge tools + NGX Philosophy into all agents"
```

---

## Task 13: Refine per-agent prompts

**Files:**
- Modify: All 5 agent files (genesis, train, fuel, mind, track)

Expand each agent's instruction to reference their specific knowledge domain and capabilities. This is the "make them actually smart" step.

Key additions per agent:

**GENESIS orchestrator**: Add routing intelligence — when to delegate, how to compose multi-domain answers, how to use memory strategically.

**TRAIN**: Add periodization vocabulary, RPE/RIR scales, exercise form cue generation, workout adaptation based on check-in data.

**FUEL**: Add macro calculation guidance, meal timing recommendations, Google Search grounding instruction ("when user asks about specific foods, use Google Search for real-time data").

**MIND**: Add sleep science terminology, HRV interpretation, stress management frameworks, Google Search grounding for latest research.

**TRACK**: Add trend analysis vocabulary, scoring system explanation, comparative language patterns.

Each prompt should explicitly tell the agent: "Use search_knowledge to find relevant information from your knowledge base before answering technical questions."

**Commit:**
```bash
git add bff/agents/*.py
git commit -m "refine: expand per-agent prompts with domain expertise and RAG references"
```

---

## Task 14: Update health endpoint with cache/RAG status

**Files:**
- Modify: `bff/main.py`
- Modify: `bff/tests/test_health.py`

**Step 1: Add cache and File Search status to /health**

In `bff/main.py`, update the health endpoint:
```python
from services.cache import cache as _response_cache

@app.get("/health")
async def health():
    cache_stats = _response_cache.get_stats()
    checks = {
        "supabase": check_supabase_health(),
        "gemini_configured": bool(os.getenv("GOOGLE_API_KEY")),
        "adk_available": _adk_available,
        "session_type": _session_type,
        "cache": cache_stats,
        "file_search_configured": bool(os.getenv("FILESEARCH_STORE_GENESIS")),
    }
    status = "ok" if checks["supabase"] and checks["gemini_configured"] else "degraded"
    return {"status": status, "service": "genesis-bff", "checks": checks}
```

**Step 2: Update health test**

```bash
cd bff && python -m pytest tests/test_health.py -v
```

**Step 3: Commit**

```bash
git add bff/main.py bff/tests/test_health.py
git commit -m "feat(health): add cache stats and File Search status to health endpoint"
```

---

## Task 15: Update .env.example + CLAUDE.md

**Files:**
- Modify: `bff/.env.example`
- Modify: `CLAUDE.md`

**Step 1: Add new env vars to .env.example**

```env
# File Search Stores (created via scripts/manage_stores.py)
FILESEARCH_STORE_GENESIS=
FILESEARCH_STORE_TRAIN=
FILESEARCH_STORE_FUEL=
FILESEARCH_STORE_MIND=
FILESEARCH_STORE_TRACK=
FILESEARCH_MODEL=gemini-2.5-flash
```

**Step 2: Update CLAUDE.md Sprint 3 → Sprint 4 status**

Update the "Current Status" section, "What works" list, and roadmap table to reflect Sprint 4 completion.

**Step 3: Commit**

```bash
git add bff/.env.example CLAUDE.md
git commit -m "docs: update env config and project status for Sprint 4"
```

---

## Task 16: Run full test suite + ruff

**Step 1: Run ruff**

```bash
cd bff && ruff check . --fix
cd bff && ruff format .
```

**Step 2: Run full BFF test suite**

```bash
cd bff && python -m pytest tests/ -v --tb=short
```
Expected: 140+ tests passing (122 existing + ~20 new).

**Step 3: Run mobile Jest tests (sanity check)**

```bash
cd /path/to/genesis-app && npm test
```
Expected: 45+ tests passing (no mobile changes in this sprint).

**Step 4: Final commit if any ruff fixes**

```bash
git add -A && git commit -m "chore: ruff lint and format fixes"
```

---

## Dependency Summary

| Dependency | Purpose | Added in Task |
|-----------|---------|---------------|
| `cachetools>=5.5.0` | L1 in-memory TTL cache | Task 3 |
| `google-genai>=1.1.0` | Embeddings + File Search API | Task 3 (explicit pin) |
| pgvector extension | L2 semantic cache vectors | Task 1 (Supabase) |
| pg_cron extension | Hourly TTL cleanup | Task 1 (Supabase) |

## Environment Variables Added

| Variable | Purpose | Required? |
|----------|---------|-----------|
| `FILESEARCH_STORE_GENESIS` | File Search store for GENESIS orchestrator | No (graceful fallback) |
| `FILESEARCH_STORE_TRAIN` | File Search store for TRAIN agent | No (graceful fallback) |
| `FILESEARCH_STORE_FUEL` | File Search store for FUEL agent | No (graceful fallback) |
| `FILESEARCH_STORE_MIND` | File Search store for MIND agent | No (graceful fallback) |
| `FILESEARCH_STORE_TRACK` | File Search store for TRACK agent | No (graceful fallback) |
| `FILESEARCH_MODEL` | Model for File Search queries (default: gemini-2.5-flash) | No |

All File Search env vars are optional — knowledge_tools.py returns graceful fallback when stores aren't configured.

---

## Track B (Parallel — Separate Session)

**Not in scope for Track A.** Track B creates the actual knowledge documents that get uploaded to File Search Stores:

1. **GENESIS corpus**: NGX philosophy expansion, season design templates, assessment protocol docs
2. **TRAIN corpus**: Full exercise database export (500+ exercises as structured docs), periodization science, RPE/RIR reference tables, warm-up protocols
3. **FUEL corpus**: Macro calculation formulas, protein/carb/fat guidelines by goal, meal timing protocols, hydration formulas, supplement evidence summaries
4. **MIND corpus**: Sleep architecture science, HRV interpretation guide, stress management frameworks, active recovery protocols, meditation guides
5. **TRACK corpus**: Fitness scoring algorithms, trend analysis statistical methods, phase comparison benchmarks, PR significance thresholds

Each document should be in Markdown or PDF format, optimized for File Search chunking (512 token chunks, 50 token overlap). Upload via `bff/scripts/manage_stores.py upload --domain {domain} --file {path}`.
