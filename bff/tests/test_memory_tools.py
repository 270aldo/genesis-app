"""Memory tools tests — verify user memory storage and retrieval."""

from unittest.mock import MagicMock, patch


# --- Mock helpers (same pattern as test_tools.py) ---

def make_mock_tool_context(user_id="test-user-123"):
    ctx = MagicMock()
    ctx.state = {"user_id": user_id}
    return ctx


def make_mock_supabase():
    mock = MagicMock()
    chain = MagicMock()
    chain.execute.return_value = MagicMock(data=[], count=0)
    chain.select.return_value = chain
    chain.insert.return_value = chain
    chain.eq.return_value = chain
    chain.order.return_value = chain
    chain.limit.return_value = chain
    mock.table.return_value = chain
    return mock, chain


# =====================================================================
# get_user_memories
# =====================================================================

class TestGetUserMemories:
    def test_success(self):
        from agents.tools.memory_tools import get_user_memories

        mock_sb, chain = make_mock_supabase()
        chain.execute.return_value = MagicMock(data=[
            {"id": "m1", "category": "preference", "content": "Prefiere entrenar por la mañana", "confidence": 1.0, "updated_at": "2026-02-11"},
            {"id": "m2", "category": "health_fact", "content": "Alergia al gluten", "confidence": 0.9, "updated_at": "2026-02-10"},
        ])
        ctx = make_mock_tool_context()

        with patch("agents.tools.memory_tools.get_supabase", return_value=mock_sb):
            result = get_user_memories(tool_context=ctx)

        assert result["total"] == 2
        assert "preference" in result["memories"]
        assert "health_fact" in result["memories"]

    def test_no_memories(self):
        from agents.tools.memory_tools import get_user_memories

        mock_sb, chain = make_mock_supabase()
        chain.execute.return_value = MagicMock(data=[])
        ctx = make_mock_tool_context()

        with patch("agents.tools.memory_tools.get_supabase", return_value=mock_sb):
            result = get_user_memories(tool_context=ctx)

        assert "message" in result
        assert result["memories"] == []

    def test_no_user_id(self):
        from agents.tools.memory_tools import get_user_memories

        ctx = MagicMock()
        ctx.state = {"user_id": None}
        result = get_user_memories(tool_context=ctx)
        assert "error" in result

    def test_with_category_filter(self):
        from agents.tools.memory_tools import get_user_memories

        mock_sb, chain = make_mock_supabase()
        chain.execute.return_value = MagicMock(data=[
            {"id": "m1", "category": "preference", "content": "Prefiere PPL", "confidence": 1.0, "updated_at": "2026-02-11"},
        ])
        ctx = make_mock_tool_context()

        with patch("agents.tools.memory_tools.get_supabase", return_value=mock_sb):
            result = get_user_memories(category="preference", tool_context=ctx)

        assert result["total"] == 1

    def test_suggested_widgets(self):
        from agents.tools.memory_tools import get_user_memories

        mock_sb, chain = make_mock_supabase()
        chain.execute.return_value = MagicMock(data=[
            {"id": "m1", "category": "general", "content": "Test memory", "confidence": 1.0, "updated_at": "2026-02-11"},
        ])
        ctx = make_mock_tool_context()

        with patch("agents.tools.memory_tools.get_supabase", return_value=mock_sb):
            result = get_user_memories(tool_context=ctx)

        assert "suggested_widgets" in result
        assert result["suggested_widgets"][0]["type"] == "insight-card"


# =====================================================================
# store_user_memory
# =====================================================================

class TestStoreUserMemory:
    def test_success(self):
        from agents.tools.memory_tools import store_user_memory

        mock_sb, chain = make_mock_supabase()
        chain.execute.return_value = MagicMock(data=[{"id": "new-mem-1"}])
        ctx = make_mock_tool_context()

        with patch("agents.tools.memory_tools.get_supabase", return_value=mock_sb):
            result = store_user_memory(category="preference", content="Entrena por la mañana", tool_context=ctx)

        assert result["stored"] is True
        assert result["category"] == "preference"

    def test_empty_content(self):
        from agents.tools.memory_tools import store_user_memory

        ctx = make_mock_tool_context()
        result = store_user_memory(category="general", content="  ab  ", tool_context=ctx)
        assert "error" in result
        assert "short" in result["error"].lower()

    def test_invalid_category(self):
        from agents.tools.memory_tools import store_user_memory

        ctx = make_mock_tool_context()
        result = store_user_memory(category="invalid_cat", content="Some valid content here", tool_context=ctx)
        assert "error" in result
        assert "Invalid category" in result["error"]

    def test_no_user_id(self):
        from agents.tools.memory_tools import store_user_memory

        ctx = MagicMock()
        ctx.state = {"user_id": None}
        result = store_user_memory(category="general", content="Test content here", tool_context=ctx)
        assert "error" in result

    def test_suggested_widgets(self):
        from agents.tools.memory_tools import store_user_memory

        mock_sb, chain = make_mock_supabase()
        chain.execute.return_value = MagicMock(data=[{"id": "new-mem-1"}])
        ctx = make_mock_tool_context()

        with patch("agents.tools.memory_tools.get_supabase", return_value=mock_sb):
            result = store_user_memory(category="health_fact", content="Alergia al marisco", tool_context=ctx)

        assert "suggested_widgets" in result
        assert result["suggested_widgets"][0]["type"] == "coach-message"
