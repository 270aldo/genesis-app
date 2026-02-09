import uuid
import logging
from datetime import date

from models.responses import ChatResponse, WidgetPayload
from services.gemini_client import generate_response
from services.supabase import get_supabase

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Fallback stubs — used when Gemini is unavailable
# ---------------------------------------------------------------------------

AGENT_STUBS: dict[str, dict[str, str]] = {
    "genesis": {
        "default": "Soy GENESIS, tu asistente de entrenamiento con IA. ¿En qué puedo ayudarte hoy con tu training, nutrición o recovery?",
    },
    "train": {
        "default": "Soy el agente Train. Puedo ayudarte a planificar y optimizar tus entrenamientos.",
    },
    "fuel": {
        "default": "Soy el agente Fuel. Puedo ayudarte con planificación nutricional y tracking de comidas.",
    },
    "mind": {
        "default": "Soy el agente Mind. Puedo ayudarte con mindset, manejo de estrés y rendimiento mental.",
    },
    "track": {
        "default": "Soy el agente Track. Puedo ayudarte a monitorear tu progreso y analizar tendencias.",
    },
    "vision": {
        "default": "Soy el agente Vision. Puedo ayudarte con escaneo de alimentos y análisis de forma.",
    },
    "coach_bridge": {
        "default": "Soy el agente Coach Bridge. Transmito tus datos e insights a tu coach.",
    },
}

# ---------------------------------------------------------------------------
# Agent persona prompts
# ---------------------------------------------------------------------------

AGENT_PERSONAS: dict[str, str] = {
    "genesis": (
        "Eres GENESIS, un coach de fitness general con IA. "
        "Eres cálido, motivador y basado en datos. "
        "Cubres training, nutrición y recovery de forma integral."
    ),
    "train": (
        "Eres el agente Train de GENESIS, un especialista en entrenamiento. "
        "Te enfocas en forma correcta, periodización y sobrecarga progresiva. "
        "Das indicaciones técnicas claras y prácticas."
    ),
    "fuel": (
        "Eres el agente Fuel de GENESIS, un coach de nutrición. "
        "Te enfocas en macros, timing de comidas e hidratación. "
        "Das recomendaciones prácticas y basadas en la ciencia."
    ),
    "mind": (
        "Eres el agente Mind de GENESIS, un coach de recovery y mindset. "
        "Te enfocas en sueño, manejo de estrés y rendimiento mental. "
        "Usas un tono empático y motivador."
    ),
    "track": (
        "Eres el agente Track de GENESIS, un analista de progreso. "
        "Te enfocas en tendencias de datos, PRs y adherencia al plan. "
        "Presentas la información de forma clara y accionable."
    ),
    "vision": (
        "Eres el agente Vision de GENESIS, especialista en análisis visual. "
        "Puedes ayudar con escaneo de alimentos y análisis de forma. "
        "Por ahora, reconoce las solicitudes visuales y da consejos generales."
    ),
    "coach_bridge": (
        "Eres el agente Coach Bridge de GENESIS. "
        "Tu rol es resumir datos e insights del usuario para coaches humanos. "
        "Presenta la información de forma estructurada y profesional."
    ),
}

BASE_SYSTEM_INSTRUCTIONS = (
    "IMPORTANTE: Siempre responde en español. "
    "Sé conciso pero útil. Usa un tono profesional pero cercano. "
    "No inventes datos que no tengas — si no tienes información suficiente, dilo. "
    "Cuando sea relevante, sugiere acciones concretas que el usuario pueda tomar."
)


# ---------------------------------------------------------------------------
# User context fetching
# ---------------------------------------------------------------------------

def _fetch_user_context(user_id: str) -> str:
    """Fetch user profile, active season, and today's check-in from Supabase.

    Returns a formatted context string to inject into the system prompt.
    All queries are wrapped in try/except so a partial failure doesn't
    prevent the chat from working.
    """
    context_parts: list[str] = []
    sb = get_supabase()

    # Profile
    try:
        profile_result = (
            sb.table("profiles")
            .select("full_name, experience_level")
            .eq("id", user_id)
            .limit(1)
            .single()
            .execute()
        )
        data = profile_result.data
        if data:
            name = data.get("full_name", "Usuario")
            level = data.get("experience_level", "intermedio")
            context_parts.append(
                f"Nombre del usuario: {name}. Nivel de experiencia: {level}."
            )
    except Exception:
        logger.debug("Could not fetch profile for user %s", user_id)

    # Active season + current phase
    try:
        season_result = (
            sb.table("seasons")
            .select("name, status, start_date, end_date")
            .eq("user_id", user_id)
            .eq("status", "active")
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )
        if season_result.data:
            s = season_result.data[0]
            context_parts.append(
                f"Season activo: {s.get('name', 'Sin nombre')} "
                f"({s.get('start_date', '?')} — {s.get('end_date', '?')})."
            )
    except Exception:
        logger.debug("Could not fetch season for user %s", user_id)

    # Today's check-in
    try:
        today_str = date.today().isoformat()
        checkin_result = (
            sb.table("check_ins")
            .select("mood, energy, sleep_hours")
            .eq("user_id", user_id)
            .eq("date", today_str)
            .limit(1)
            .execute()
        )
        if checkin_result.data:
            ci = checkin_result.data[0]
            mood = ci.get("mood", "?")
            energy = ci.get("energy", "?")
            sleep = ci.get("sleep_hours", "?")
            context_parts.append(
                f"Check-in de hoy: mood={mood}/10, energía={energy}/10, "
                f"sueño={sleep}h."
            )
    except Exception:
        logger.debug("Could not fetch check-in for user %s", user_id)

    # Last completed workout summary
    try:
        session_result = (
            sb.table("sessions")
            .select("name, scheduled_date, completed_at")
            .eq("user_id", user_id)
            .filter("completed_at", "not.is", "null")
            .order("completed_at", desc=True)
            .limit(1)
            .execute()
        )
        if session_result.data:
            sess = session_result.data[0]
            context_parts.append(
                f"Último workout completado: {sess.get('name', 'Sesión')} "
                f"el {sess.get('scheduled_date', '?')}."
            )
    except Exception:
        logger.debug("Could not fetch last session for user %s", user_id)

    if not context_parts:
        return "No hay datos de contexto disponibles para este usuario."

    return "\n".join(context_parts)


# ---------------------------------------------------------------------------
# Widget generation heuristics
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
                type="metric_card",
                title="Recovery Score",
                value="--",
                data={"status": "info", "note": "Basado en tu último check-in"},
            )
        )
    elif any(kw in combined for kw in ["comida", "macro", "nutrition", "comer", "meal", "proteína", "carbos", "nutrición"]):
        widgets.append(
            WidgetPayload(
                id=str(uuid.uuid4()),
                type="metric_card",
                title="Resumen Nutricional",
                value="--",
                data={"note": "Revisa tu tracking de macros"},
            )
        )
    elif any(kw in combined for kw in ["season", "fase", "progreso", "progress", "temporada"]):
        widgets.append(
            WidgetPayload(
                id=str(uuid.uuid4()),
                type="progress_indicator",
                title="Progreso del Season",
                value="--",
            )
        )

    return widgets


# ---------------------------------------------------------------------------
# Main routing function
# ---------------------------------------------------------------------------

async def route_to_agent(
    agent_id: str,
    message: str,
    user_id: str,
    conversation_id: str | None = None,
) -> ChatResponse:
    """Route a user message to the appropriate GENESIS agent.

    Attempts to generate a response via Gemini (Vertex AI) with injected
    user context. Falls back to AGENT_STUBS if Gemini is unavailable or
    returns an empty response.
    """
    resolved_conversation_id = conversation_id or str(uuid.uuid4())

    # --- Build system prompt ---
    persona = AGENT_PERSONAS.get(agent_id, AGENT_PERSONAS["genesis"])
    user_context = _fetch_user_context(user_id)

    system_prompt = (
        f"{persona}\n\n"
        f"{BASE_SYSTEM_INSTRUCTIONS}\n\n"
        f"--- Contexto del usuario ---\n{user_context}"
    )

    # --- Call Gemini ---
    response_text = await generate_response(
        system_prompt=system_prompt,
        user_message=message,
    )

    # --- Fallback to stubs if Gemini returned nothing ---
    if not response_text:
        logger.info(
            "Gemini returned empty response for agent=%s; using stub fallback",
            agent_id,
        )
        agent = AGENT_STUBS.get(agent_id, AGENT_STUBS["genesis"])
        response_text = agent["default"]

    # --- Generate widgets ---
    widgets = _generate_widgets(message, response_text)

    return ChatResponse(
        id=str(uuid.uuid4()),
        response=response_text,
        widgets=widgets if widgets else None,
        conversation_id=resolved_conversation_id,
    )
