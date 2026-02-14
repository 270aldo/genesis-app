"""Agent router — routes messages through ADK agents.

Replaces the previous prompt-based routing with ADK Runner-based
orchestration. The GENESIS root agent delegates to specialist
sub-agents (train, fuel, mind, track) as needed.

The function signature `route_to_agent(agent_id, message, user_id,
conversation_id) -> ChatResponse` is preserved for backward compatibility.
"""

import json
import os
import re
import uuid
import logging

from google.genai import types
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService

from models.responses import ChatResponse, WidgetPayload
from services.guardrails import validate_input, validate_output
from services.cache import cache as _cache

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# ADK singletons — created once at import (declarative, no API calls)
# ---------------------------------------------------------------------------

_runner: Runner | None = None
_session_service = None
_adk_available = False
_session_type = "none"

try:
    from agents.genesis_agent import genesis_agent

    db_url = os.getenv("DATABASE_URL")
    if db_url:
        try:
            from google.adk.sessions import DatabaseSessionService

            _session_service = DatabaseSessionService(db_url=db_url)
            _session_type = "database"
            logger.info("Using DatabaseSessionService (persistent)")
        except Exception as db_exc:
            logger.warning("DatabaseSessionService init failed (%s) — falling back to in-memory", db_exc)
            _session_service = InMemorySessionService()
            _session_type = "in_memory"
    else:
        _session_service = InMemorySessionService()
        _session_type = "in_memory"
        logger.info("No DATABASE_URL — using InMemorySessionService")

    _runner = Runner(
        agent=genesis_agent,
        app_name="genesis_bff",
        session_service=_session_service,
    )
    _adk_available = True
    logger.info("ADK Runner initialized successfully (session_type=%s)", _session_type)
except Exception as exc:
    logger.warning("ADK Runner init failed (%s) — falling back to stubs", exc)


# ---------------------------------------------------------------------------
# Fallback stubs — used when ADK/Gemini is unavailable
# ---------------------------------------------------------------------------

AGENT_STUBS: dict[str, str] = {
    "genesis": "Soy GENESIS, tu coach de fitness con IA. ¿En qué puedo ayudarte hoy con tu training, nutrición o recovery?",
    "train": "Soy GENESIS. Puedo ayudarte a planificar y optimizar tus entrenamientos.",
    "fuel": "Soy GENESIS. Puedo ayudarte con planificación nutricional y tracking de comidas.",
    "mind": "Soy GENESIS. Puedo ayudarte con bienestar, manejo de estrés y rendimiento mental.",
    "track": "Soy GENESIS. Puedo ayudarte a monitorear tu progreso y analizar tendencias.",
    "vision": "Soy GENESIS. Puedo ayudarte con escaneo de alimentos y análisis de forma.",
    "coach_bridge": "Soy GENESIS. Transmito tus datos e insights a tu coach.",
}


# ---------------------------------------------------------------------------
# Session management
# ---------------------------------------------------------------------------

async def _get_or_create_session(user_id: str, conversation_id: str):
    """Get an existing session or create a new one with user_id in state."""
    existing = await _session_service.get_session(
        app_name="genesis_bff",
        user_id=user_id,
        session_id=conversation_id,
    )
    if existing:
        return existing

    return await _session_service.create_session(
        app_name="genesis_bff",
        user_id=user_id,
        session_id=conversation_id,
        state={"user_id": user_id},
    )


# ---------------------------------------------------------------------------
# Widget generation heuristics (backward compat for mobile app)
# ---------------------------------------------------------------------------

def _generate_widgets(message: str, response_text: str) -> list[WidgetPayload]:
    """Generate lightweight widget hints based on message/response content."""
    widgets: list[WidgetPayload] = []
    lower_msg = message.lower()
    lower_resp = response_text.lower()
    combined = lower_msg + " " + lower_resp

    if any(kw in combined for kw in ["workout", "entreno", "ejercicio", "train", "entrenamiento"]):
        widgets.append(
            WidgetPayload(
                id=str(uuid.uuid4()),
                type="metric-card",
                title="Recovery Score",
                value="--",
                data={"status": "info", "note": "Basado en tu último check-in"},
            )
        )
    elif any(kw in combined for kw in ["comida", "macro", "nutrition", "comer", "meal", "proteína", "carbos", "nutrición"]):
        widgets.append(
            WidgetPayload(
                id=str(uuid.uuid4()),
                type="metric-card",
                title="Resumen Nutricional",
                value="--",
                data={"note": "Revisa tu tracking de macros"},
            )
        )
    elif any(kw in combined for kw in ["season", "fase", "progreso", "progress", "temporada"]):
        widgets.append(
            WidgetPayload(
                id=str(uuid.uuid4()),
                type="progress-dashboard",
                title="Progreso del Season",
                value="--",
            )
        )

    return widgets


# ---------------------------------------------------------------------------
# Widget extraction from agent response text
# ---------------------------------------------------------------------------

def _extract_widgets(text: str) -> tuple[str, list[WidgetPayload]]:
    """Extract ```widget JSON blocks from agent response text.

    Returns (clean_text, extracted_widgets) where clean_text has
    the widget blocks removed.
    """
    pattern = r"```widget\s*\n(.*?)\n```"
    widgets: list[WidgetPayload] = []
    for match in re.finditer(pattern, text, re.DOTALL):
        try:
            data = json.loads(match.group(1))
            widgets.append(WidgetPayload(
                id=str(uuid.uuid4()),
                type=data.get("type", "insight-card"),
                title=data.get("title"),
                subtitle=data.get("subtitle"),
                value=data.get("value"),
                data=data.get("data"),
            ))
        except (json.JSONDecodeError, KeyError):
            continue
    clean_text = re.sub(pattern, "", text, flags=re.DOTALL).strip()
    return clean_text, widgets


# ---------------------------------------------------------------------------
# Main routing function
# ---------------------------------------------------------------------------

async def route_to_agent(
    agent_id: str,
    message: str,
    user_id: str,
    conversation_id: str | None = None,
) -> ChatResponse:
    """Route a user message through the ADK agent system.

    Attempts to run the message through the GENESIS root agent (which
    delegates to sub-agents as needed). Falls back to AGENT_STUBS if
    ADK is unavailable or returns an empty response.
    """
    resolved_conversation_id = conversation_id or str(uuid.uuid4())

    # Input guardrail
    guardrail_result = validate_input(message)
    if not guardrail_result.allowed:
        return ChatResponse(
            id=str(uuid.uuid4()),
            response=f"No puedo procesar ese mensaje. {guardrail_result.reason}",
            widgets=None,
            conversation_id=resolved_conversation_id,
        )

    # -----------------------------------------------------------------------
    # L1 cache check (exact match, in-memory)
    # -----------------------------------------------------------------------
    l1_hit = _cache.get_l1(message, user_id)
    if l1_hit:
        logger.info("L1 cache hit — returning cached response")
        return ChatResponse(
            id=str(uuid.uuid4()),
            response=l1_hit.get("response", ""),
            widgets=l1_hit.get("widgets"),
            conversation_id=resolved_conversation_id,
        )

    # -----------------------------------------------------------------------
    # L2 cache check (semantic similarity, pgvector)
    # -----------------------------------------------------------------------
    query_embedding = None
    try:
        from services.embeddings import generate_embedding

        query_embedding = generate_embedding(message)
        if query_embedding:
            l2_hit = _cache.get_l2(embedding=query_embedding, user_id=user_id)
            if l2_hit:
                logger.info("L2 cache hit — returning semantically cached response")
                response_text_cached = l2_hit["response_text"]
                widgets_json = l2_hit.get("response_widgets")
                widgets_cached = json.loads(widgets_json) if widgets_json else None
                # Also populate L1 for faster next hit
                _cache.set_l1(message, user_id, {
                    "response": response_text_cached,
                    "widgets": widgets_cached,
                })
                return ChatResponse(
                    id=str(uuid.uuid4()),
                    response=response_text_cached,
                    widgets=widgets_cached,
                    conversation_id=resolved_conversation_id,
                )
    except Exception as exc:
        logger.debug("L2 cache check skipped: %s", exc)
        query_embedding = None

    response_text = ""

    if _adk_available and _runner and _session_service:
        try:
            session = await _get_or_create_session(user_id, resolved_conversation_id)

            # Add routing hint for specific sub-agents
            routed_message = message
            if agent_id not in ("genesis", "vision", "coach_bridge"):
                routed_message = f"[Dirigir a agente: {agent_id}] {message}"

            new_message = types.Content(
                role="user",
                parts=[types.Part.from_text(text=routed_message)],
            )

            async for event in _runner.run_async(
                user_id=user_id,
                session_id=session.id,
                new_message=new_message,
            ):
                if event.is_final_response() and event.content and event.content.parts:
                    for part in event.content.parts:
                        if hasattr(part, "text") and part.text:
                            response_text += part.text

        except Exception as exc:
            err_str = str(exc).lower()
            if any(kw in err_str for kw in ("api key", "authentication", "permission", "403", "401")):
                logger.critical("ADK auth error (check GOOGLE_API_KEY): %s", exc, exc_info=True)
            else:
                logger.error("ADK agent error: %s", exc, exc_info=True)

    # Fallback to stubs if ADK returned nothing
    if not response_text:
        logger.info(
            "ADK returned empty response for agent=%s; using stub fallback",
            agent_id,
        )
        response_text = AGENT_STUBS.get(agent_id, AGENT_STUBS["genesis"])

    # Output guardrail — sanitize agent identity leaks
    response_text = validate_output(response_text)

    # Widget extraction from agent response, with heuristic fallback
    clean_text, extracted_widgets = _extract_widgets(response_text)
    if extracted_widgets:
        response_text = clean_text
        widgets = extracted_widgets
    else:
        widgets = _generate_widgets(message, response_text)

    # -----------------------------------------------------------------------
    # Store in L1 + L2 cache for future hits
    # -----------------------------------------------------------------------
    try:
        widget_dicts = [w.dict() for w in widgets] if widgets else None
        _cache.set_l1(message, user_id, {
            "response": response_text,
            "widgets": widget_dicts,
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
                response_widgets=widget_dicts,
            )
    except Exception as cache_exc:
        logger.debug("Cache store failed (non-blocking): %s", cache_exc)

    return ChatResponse(
        id=str(uuid.uuid4()),
        response=response_text,
        widgets=widgets if widgets else None,
        conversation_id=resolved_conversation_id,
    )
