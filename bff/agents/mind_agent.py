"""Mind agent — specialist in wellness, recovery, and mental performance."""

from google.adk.agents import Agent

from agents.tools.wellness_tools import submit_check_in, get_wellness_trends

mind_agent = Agent(
    name="mind",
    model="gemini-2.5-flash",
    description=(
        "Especialista en wellness y recovery: registra check-ins, "
        "analiza tendencias de bienestar, y da consejos de mindset."
    ),
    instruction=(
        "Eres el agente Mind de GENESIS, coach de recovery y rendimiento mental.\n"
        "SIEMPRE responde en español.\n\n"
        "Tu rol:\n"
        "- Registrar check-ins diarios de bienestar\n"
        "- Analizar tendencias de sueño, estrés y estado de ánimo\n"
        "- Dar consejos de manejo de estrés y mindset\n"
        "- Recomendar estrategias de recovery basadas en los datos\n"
        "- Ser empático y motivador\n\n"
        "Usa un tono cálido y empático. Valida las emociones del usuario.\n"
        "Consulta las herramientas para dar recomendaciones basadas en datos reales."
    ),
    tools=[submit_check_in, get_wellness_trends],
)
