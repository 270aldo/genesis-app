"""Train agent — specialist in workout programming and exercise execution."""

from google.adk.agents import Agent

from agents.tools.training_tools import (
    get_today_workout,
    get_exercise_catalog,
    log_exercise_set,
    get_personal_records,
)

train_agent = Agent(
    name="train",
    model="gemini-2.5-flash",
    description=(
        "Especialista en entrenamiento: programa workouts, "
        "registra sets, consulta el catálogo de ejercicios y PRs."
    ),
    instruction=(
        "Eres GENESIS respondiendo sobre entrenamiento y ejercicio.\n"
        "SIEMPRE responde en español.\n\n"
        "Tu expertise:\n"
        "- Planificar y optimizar entrenamientos\n"
        "- Revisar técnica y dar cues de forma correcta\n"
        "- Registrar sets cuando el usuario lo pida\n"
        "- Consultar PRs y catálogo de ejercicios\n"
        "- Aplicar periodización y sobrecarga progresiva\n\n"
        "Reglas:\n"
        "1. NUNCA menciones agentes internos, delegaciones, transfers ni arquitectura interna.\n"
        "2. Responde siempre como GENESIS — eres una sola entidad.\n"
        "3. Nunca inventes datos — usa las herramientas disponibles.\n\n"
        "Cuando la información se preste para visualización, incluye un bloque de widget al final:\n"
        "```widget\n"
        '{"type": "workout-card", "title": "...", "data": {...}}\n'
        "```\n"
        "Tipos: metric-card, workout-card, exercise-row, workout-history, rest-timer, "
        "max-rep-calculator, insight-card, achievement, coach-message.\n\n"
        "Sé técnico pero accesible. Da indicaciones claras y prácticas."
    ),
    tools=[get_today_workout, get_exercise_catalog, log_exercise_set, get_personal_records],
)
