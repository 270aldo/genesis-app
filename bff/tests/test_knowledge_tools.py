"""Tests for File Search knowledge retrieval tools."""

from unittest.mock import patch


class TestSearchKnowledge:
    """File Search wrapper tool for ADK agents."""

    def test_search_knowledge_returns_fallback_when_no_store(self):
        """Should return fallback when store is not configured."""
        from agents.tools.knowledge_tools import search_knowledge

        result = search_knowledge(query="periodization principles", domain="train")
        assert "results" in result
        assert "not yet configured" in result["results"]
        assert result["source"] == "fallback"

    def test_search_knowledge_with_invalid_domain(self):
        """Should return error for unknown domain."""
        from agents.tools.knowledge_tools import search_knowledge

        result = search_knowledge(query="test", domain="invalid_domain")
        assert "error" in result

    def test_search_knowledge_handles_api_error(self):
        """Should gracefully handle File Search API failures."""
        import os

        with patch.dict(os.environ, {"FILESEARCH_STORE_TRAIN": "projects/test/stores/123"}):
            # Need to reload to pick up env change
            import importlib
            import agents.tools.knowledge_tools as kt
            importlib.reload(kt)

            with patch.object(kt, "_get_genai_client") as mock_client:
                mock_client.return_value.models.generate_content.side_effect = Exception(
                    "API fail"
                )
                result = kt.search_knowledge(query="test", domain="train")
                assert "error" in result

            # Reset module
            importlib.reload(kt)

    def test_search_knowledge_includes_suggested_widget(self):
        """Tool responses should include suggested_widgets for A2UI."""
        from agents.tools.knowledge_tools import search_knowledge

        result = search_knowledge(query="recovery", domain="mind")
        assert "suggested_widgets" in result

    def test_search_knowledge_all_valid_domains(self):
        """All 5 domains should be valid."""
        from agents.tools.knowledge_tools import VALID_DOMAINS

        assert VALID_DOMAINS == {"genesis", "train", "fuel", "mind", "track"}
