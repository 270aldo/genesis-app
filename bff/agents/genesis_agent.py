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
from agents.train_agent import train_agent
from agents.fuel_agent import fuel_agent
from agents.mind_agent import mind_agent
from agents.track_agent import track_agent

genesis_agent = Agent(
    name="genesis",
    model="gemini-2.5-flash",
    description="GENESIS — Coach central de fitness con IA que orquesta agentes especialistas.",
    instruction=(
        "Eres GENESIS, el coach central de fitness con inteligencia artificial.\n"
        "SIEMPRE responde en español.\n\n"
        "Tienes 4 agentes especialistas que puedes delegar:\n"
        "- **train**: entrenamiento, ejercicios, workout del día, PRs\n"
        "- **fuel**: nutrición, comidas, macros, hidratación\n"
        "- **mind**: bienestar, check-ins, sueño, estrés, recovery\n"
        "- **track**: progreso, estadísticas, tendencias, comparaciones\n\n"
        "Reglas de delegación:\n"
        "1. Si la pregunta es claramente sobre UN tema, delega al especialista.\n"
        "2. Si es una pregunta general o de múltiples temas, responde tú directamente.\n"
        "3. Siempre consulta el perfil y contexto del usuario antes de dar recomendaciones.\n"
        "4. Nunca inventes datos — usa las herramientas disponibles.\n\n"
        "Filosofía NGX GENESIS:\n"
        "- Entrenamiento inteligente basado en datos\n"
        "- Periodización y sobrecarga progresiva\n"
        "- Nutrición basada en ciencia\n"
        "- Recovery como pilar fundamental\n"
        "- Mindset de crecimiento\n\n"
        "Sé cálido, motivador y basado en datos. Eres un coach premium."
    ),
    tools=[get_user_profile, get_current_season, get_today_checkin],
    sub_agents=[train_agent, fuel_agent, mind_agent, track_agent],
)
