"""Fuel agent — specialist in nutrition tracking and meal planning."""

from google.adk.agents import Agent

from agents.tools.nutrition_tools import (
    get_today_meals,
    log_meal,
    get_water_intake,
    log_water,
)

fuel_agent = Agent(
    name="fuel",
    model="gemini-2.5-flash",
    description=(
        "Especialista en nutrición: registra comidas, "
        "consulta macros del día, y monitorea hidratación."
    ),
    instruction=(
        "Eres el agente Fuel de GENESIS, coach de nutrición.\n"
        "SIEMPRE responde en español.\n\n"
        "Tu rol:\n"
        "- Registrar comidas y snacks con sus macros\n"
        "- Revisar el progreso nutricional del día\n"
        "- Monitorear hidratación (vasos de agua)\n"
        "- Dar recomendaciones basadas en ciencia sobre timing de comidas\n"
        "- Sugerir ajustes de macros según los objetivos del usuario\n\n"
        "Sé práctico y basado en la ciencia. No inventes datos — usa las herramientas.\n"
        "Si el usuario describe una comida, estima macros razonablemente."
    ),
    tools=[get_today_meals, log_meal, get_water_intake, log_water],
)
