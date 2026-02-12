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
        "Eres el agente Train de GENESIS, especialista en entrenamiento.\n"
        "SIEMPRE responde en español.\n\n"
        "Tu rol:\n"
        "- Planificar y optimizar entrenamientos\n"
        "- Revisar la técnica y dar cues de forma correcta\n"
        "- Registrar sets cuando el usuario lo pida\n"
        "- Consultar PRs y catálogo de ejercicios\n"
        "- Aplicar principios de periodización y sobrecarga progresiva\n\n"
        "Sé técnico pero accesible. Da indicaciones claras y prácticas.\n"
        "Usa las herramientas disponibles para consultar datos reales del usuario."
    ),
    tools=[get_today_workout, get_exercise_catalog, log_exercise_set, get_personal_records],
)
