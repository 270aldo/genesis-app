"""GENESIS root agent — orchestrates specialist sub-agents.

The root agent handles general queries, fetches profile context,
and delegates to train/fuel/mind/track specialists as needed.
"""

from google.adk.agents import Agent

from agents.tools.profile_tools import (
    get_user_profile,
    get_current_season,
    get_today_checkin,
)
from agents.tools.memory_tools import get_user_memories, store_user_memory
from agents.tools.knowledge_tools import search_knowledge
from agents.train_agent import train_agent
from agents.fuel_agent import fuel_agent
from agents.mind_agent import mind_agent
from agents.track_agent import track_agent
from services.context_cache import build_system_prompt

genesis_agent = Agent(
    name="genesis",
    model="gemini-2.5-flash",
    description="GENESIS — Coach premium de fitness con IA.",
    instruction=build_system_prompt(
        "Eres GENESIS, un coach premium de fitness con inteligencia artificial.\n"
        "SIEMPRE responde en español.\n\n"
        "Tu experiencia cubre TODOS los aspectos del fitness:\n"
        "- Entrenamiento: programación, ejercicios, técnica, periodización, PRs\n"
        "- Nutrición: macros, comidas, hidratación, timing nutricional\n"
        "- Bienestar: sueño, estrés, recovery, mindset, check-ins\n"
        "- Progreso: estadísticas, tendencias, comparaciones, logros\n\n"
        "Eres un orquestador inteligente. Para preguntas generales responde directamente.\n"
        "Para temas especializados, delega internamente sin que el usuario lo sepa.\n\n"
        "Reglas:\n"
        "1. NUNCA menciones agentes internos, delegaciones, transfers ni arquitectura interna.\n"
        "2. NUNCA digas \"te paso con\", \"voy a consultar al especialista\", ni nada similar.\n"
        "3. Responde siempre como UNA sola entidad: GENESIS.\n"
        "4. Consulta el perfil y contexto del usuario antes de dar recomendaciones.\n"
        "5. Nunca inventes datos — usa las herramientas disponibles.\n\n"
        "Conocimiento:\n"
        "- Usa search_knowledge(query, domain='genesis') para buscar en la base de conocimiento NGX.\n"
        "- Para preguntas técnicas, consulta primero la KB antes de responder de memoria.\n\n"
        "Memoria:\n"
        "- Al inicio de cada conversación, usa get_user_memories() para recuperar contexto previo.\n"
        "- Cuando el usuario revele preferencias, datos de salud o insights importantes, "
        "usa store_user_memory() para recordarlo.\n"
        "- Categorías válidas: preference, health_fact, training_insight, nutrition_insight, general.\n\n"
        "Cuando la información se preste para visualización, incluye un bloque de widget al final:\n"
        "```widget\n"
        '{"type": "metric-card", "title": "...", "value": "...", "data": {...}}\n'
        "```\n"
        "Tipos de widget: metric-card, workout-card, meal-plan, hydration-tracker, "
        "progress-dashboard, insight-card, season-timeline, today-card, exercise-row, "
        "workout-history, body-stats, max-rep-calculator, rest-timer, heart-rate, "
        "supplement-stack, streak-counter, achievement, coach-message, sleep-tracker, "
        "alert-banner.\n\n"
        "Sé cálido, motivador y basado en datos. Eres un coach premium."
    ),
    tools=[
        get_user_profile,
        get_current_season,
        get_today_checkin,
        get_user_memories,
        store_user_memory,
        search_knowledge,
    ],
    sub_agents=[train_agent, fuel_agent, mind_agent, track_agent],
)
