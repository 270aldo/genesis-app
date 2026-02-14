"""Tests for the 3-level cache service."""

from unittest.mock import patch, MagicMock

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


class TestL2SemanticCache:
    """L2: Supabase pgvector semantic similarity."""

    def setup_method(self):
        self.cache = CacheLayer()

    def test_set_l2_calls_supabase_insert(self, mock_supabase):
        """Verify L2 stores embedding + response in Supabase."""
        mock_sb, chain = mock_supabase
        embedding = [0.1] * 768

        with patch("services.supabase.get_supabase", return_value=mock_sb):
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

        with patch("services.supabase.get_supabase", return_value=mock_sb):
            result = self.cache.get_l2(embedding=embedding, user_id="user-1")
            mock_sb.rpc.assert_called_once()
            assert result is None

    def test_get_l2_returns_cached_response_on_hit(self, mock_supabase):
        """Verify L2 returns response when similarity >= 0.92."""
        mock_sb, chain = mock_supabase
        mock_sb.rpc.return_value = chain
        chain.execute.return_value = MagicMock(
            data=[
                {
                    "id": "cache-1",
                    "response_text": "cached answer",
                    "response_widgets": None,
                    "similarity": 0.95,
                }
            ]
        )
        embedding = [0.1] * 768

        with patch("services.supabase.get_supabase", return_value=mock_sb):
            result = self.cache.get_l2(embedding=embedding, user_id="user-1")
            assert result is not None
            assert result["response_text"] == "cached answer"

    def test_get_l2_returns_none_on_error(self, mock_supabase):
        """L2 should gracefully return None on Supabase error."""
        mock_sb, chain = mock_supabase
        mock_sb.rpc.side_effect = Exception("DB error")
        embedding = [0.1] * 768

        with patch("services.supabase.get_supabase", return_value=mock_sb):
            result = self.cache.get_l2(embedding=embedding, user_id="user-1")
            assert result is None
