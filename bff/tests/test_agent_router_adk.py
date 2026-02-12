"""ADK agent router tests — verify routing with mocked Runner.

These tests mock the ADK Runner to avoid real Gemini API calls,
verifying the route_to_agent function's behavior.
"""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch


@pytest.fixture
def mock_event_final():
    """Create a mock ADK event that is a final response."""
    event = MagicMock()
    event.is_final_response.return_value = True
    part = MagicMock()
    part.text = "Hola, soy GENESIS. ¿En qué te ayudo?"
    event.content = MagicMock()
    event.content.parts = [part]
    return event


@pytest.fixture
def mock_event_empty():
    """Create a mock ADK event with no text."""
    event = MagicMock()
    event.is_final_response.return_value = True
    event.content = MagicMock()
    event.content.parts = []
    return event


@pytest.fixture
def mock_session():
    """Create a mock session object."""
    session = MagicMock()
    session.id = "test-conv-123"
    return session


@pytest.mark.asyncio
async def test_route_to_agent_returns_chat_response(mock_event_final, mock_session):
    """Verify route_to_agent returns a valid ChatResponse with ADK response."""

    async def fake_run_async(**kwargs):
        yield mock_event_final

    with patch("services.agent_router._adk_available", True), \
         patch("services.agent_router._runner") as mock_runner, \
         patch("services.agent_router._session_service") as mock_ss:

        mock_runner.run_async = fake_run_async
        mock_ss.get_session = AsyncMock(return_value=mock_session)

        from services.agent_router import route_to_agent
        result = await route_to_agent("genesis", "Hola", "user-1", "conv-1")

    assert result.response == "Hola, soy GENESIS. ¿En qué te ayudo?"
    assert result.conversation_id == "conv-1"
    assert result.id  # Non-empty UUID


@pytest.mark.asyncio
async def test_route_to_agent_fallback_on_error(mock_session):
    """Verify fallback to stubs when Runner raises an exception."""

    async def failing_run_async(**kwargs):
        raise RuntimeError("Gemini unavailable")
        yield  # Make it an async generator

    with patch("services.agent_router._adk_available", True), \
         patch("services.agent_router._runner") as mock_runner, \
         patch("services.agent_router._session_service") as mock_ss:

        mock_runner.run_async = failing_run_async
        mock_ss.get_session = AsyncMock(return_value=mock_session)

        from services.agent_router import route_to_agent
        result = await route_to_agent("genesis", "Hola", "user-1")

    assert "GENESIS" in result.response
    assert result.conversation_id  # Auto-generated


@pytest.mark.asyncio
async def test_route_to_agent_preserves_conversation_id(mock_event_final, mock_session):
    """Verify conversation_id is preserved when provided."""

    async def fake_run_async(**kwargs):
        yield mock_event_final

    with patch("services.agent_router._adk_available", True), \
         patch("services.agent_router._runner") as mock_runner, \
         patch("services.agent_router._session_service") as mock_ss:

        mock_runner.run_async = fake_run_async
        mock_ss.get_session = AsyncMock(return_value=mock_session)

        from services.agent_router import route_to_agent
        result = await route_to_agent("genesis", "test", "user-1", "my-conv-id")

    assert result.conversation_id == "my-conv-id"


@pytest.mark.asyncio
async def test_route_to_agent_empty_response_uses_stub(mock_event_empty, mock_session):
    """Verify stub fallback when ADK returns empty response."""

    async def fake_run_async(**kwargs):
        yield mock_event_empty

    with patch("services.agent_router._adk_available", True), \
         patch("services.agent_router._runner") as mock_runner, \
         patch("services.agent_router._session_service") as mock_ss:

        mock_runner.run_async = fake_run_async
        mock_ss.get_session = AsyncMock(return_value=mock_session)

        from services.agent_router import route_to_agent
        result = await route_to_agent("train", "test", "user-1")

    assert "Train" in result.response


@pytest.mark.asyncio
async def test_route_to_agent_adk_unavailable():
    """Verify stub fallback when ADK is not available."""
    with patch("services.agent_router._adk_available", False):
        from services.agent_router import route_to_agent
        result = await route_to_agent("fuel", "test", "user-1")

    assert "Fuel" in result.response
