"""Tests for NGX Philosophy context cache."""

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
