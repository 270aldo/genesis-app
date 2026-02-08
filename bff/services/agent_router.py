import uuid
from models.responses import ChatResponse, WidgetPayload


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


async def route_to_agent(agent_id: str, message: str, user_id: str, conversation_id: str | None = None) -> ChatResponse:
    """Route message to the appropriate agent. Currently returns stub responses."""
    agent = AGENT_STUBS.get(agent_id, AGENT_STUBS["genesis"])
    response_text = agent["default"]

    lower = message.lower()
    widgets: list[WidgetPayload] = []

    if any(kw in lower for kw in ["workout", "entreno", "ejercicio", "train"]):
        response_text = "Según tu fase actual y estado de recovery, el workout de hoy se ve bien. Enfócate en sobrecarga progresiva y forma correcta."
        widgets.append(WidgetPayload(id=str(uuid.uuid4()), type="metric_card", title="Recovery Score", value="82%", data={"status": "good"}))
    elif any(kw in lower for kw in ["comida", "macro", "nutrition", "comer", "meal"]):
        response_text = "Todavía te faltan 45g de proteína y 30g de carbos hoy. Te sugiero pechuga de pollo con arroz y brócoli."
        widgets.append(WidgetPayload(id=str(uuid.uuid4()), type="metric_card", title="Macros Restantes", value="45g P / 30g C"))
    elif any(kw in lower for kw in ["recovery", "sleep", "dormir", "descanso"]):
        response_text = "Tu recovery se ve sólido. Prioriza hidratación y 7.5h+ de sueño esta noche."
        widgets.append(WidgetPayload(id=str(uuid.uuid4()), type="recommendation", title="Protocolo de Recovery", subtitle="Enfócate en hidratación y sueño"))
    elif any(kw in lower for kw in ["season", "fase", "progreso", "progress"]):
        response_text = "Estás en Season 1, Semana 3 de 12. La fase de fuerza va bien con 100% de adherencia esta semana."
        widgets.append(WidgetPayload(id=str(uuid.uuid4()), type="progress_indicator", title="Progreso del Season", value="18%"))

    return ChatResponse(
        id=str(uuid.uuid4()),
        response=response_text,
        widgets=widgets if widgets else None,
        conversation_id=conversation_id or str(uuid.uuid4()),
    )
