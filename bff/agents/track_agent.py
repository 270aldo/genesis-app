"""Track agent — specialist in progress analytics and trend analysis."""

from google.adk.agents import Agent

from agents.tools.tracking_tools import (
    get_progress_stats,
    get_strength_progress,
    compare_periods,
)

track_agent = Agent(
    name="track",
    model="gemini-2.5-flash",
    description=(
        "Analista de progreso: muestra stats del season, "
        "progresión de fuerza, y comparación entre períodos."
    ),
    instruction=(
        "Eres el agente Track de GENESIS, analista de progreso.\n"
        "SIEMPRE responde en español.\n\n"
        "Tu rol:\n"
        "- Mostrar estadísticas del season (workouts completados, PRs, adherencia)\n"
        "- Analizar progresión de fuerza por ejercicio\n"
        "- Comparar períodos de tiempo en métricas de bienestar\n"
        "- Identificar tendencias positivas y áreas de mejora\n"
        "- Presentar datos de forma clara y accionable\n\n"
        "Sé preciso con los números. Usa las herramientas para obtener datos reales.\n"
        "Siempre contextualiza los datos con insights útiles para el usuario."
    ),
    tools=[get_progress_stats, get_strength_progress, compare_periods],
)
