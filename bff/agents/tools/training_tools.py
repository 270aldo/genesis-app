"""Training-related tools for ADK agents.

Provides workout data, exercise catalog, set logging, and personal records.
"""

import logging
from datetime import date

from services.supabase import get_supabase

logger = logging.getLogger(__name__)


def get_today_workout(tool_context=None) -> dict:
    """Fetch today's scheduled workout session with exercise details.

    Returns the session data or a message if no workout is scheduled.
    """
    user_id = tool_context.state["user_id"] if tool_context else None
    if not user_id:
        return {"error": "No user_id in session state"}

    try:
        sb = get_supabase()
        result = (
            sb.table("sessions")
            .select("*, exercise_logs(*, exercises(*))")
            .eq("user_id", user_id)
            .eq("scheduled_date", date.today().isoformat())
            .is_("completed_at", "null")
            .limit(1)
            .execute()
        )
        session = result.data[0] if result.data else None
        if not session:
            return {"message": "No workout scheduled for today"}
        return {
            "session": session,
            "suggested_widgets": [{
                "type": "workout-card",
                "title": session.get("name", "Workout del Día"),
                "data": {
                    "exercise_count": len(session.get("exercise_logs", [])),
                    "session_id": session["id"],
                },
            }],
        }
    except Exception as exc:
        logger.error("get_today_workout failed: %s", exc)
        return {"error": f"Could not fetch today's workout: {exc}"}


def get_exercise_catalog(query: str = "", muscle_group: str = "", tool_context=None) -> dict:
    """Search the exercise catalog by name or muscle group.

    Args:
        query: Text search on exercise name (partial match).
        muscle_group: Filter by muscle group (e.g. "chest", "legs").

    Returns a list of matching exercises.
    """
    try:
        sb = get_supabase()
        q = sb.table("exercises").select("*").order("name")
        if muscle_group:
            q = q.contains("muscle_groups", [muscle_group])
        if query:
            q = q.ilike("name", f"%{query}%")
        result = q.limit(20).execute()
        exercises = result.data or []
        response = {"exercises": exercises}
        if exercises:
            response["suggested_widgets"] = [
                {
                    "type": "exercise-row",
                    "title": ex.get("name", "Exercise"),
                    "data": {"id": ex.get("id", ""), "muscle_groups": ex.get("muscle_groups", [])},
                }
                for ex in exercises[:5]
            ]
        return response
    except Exception as exc:
        logger.error("get_exercise_catalog failed: %s", exc)
        return {"error": f"Could not fetch exercises: {exc}"}


def log_exercise_set(
    exercise_id: str,
    set_number: int,
    weight_kg: float,
    reps: int,
    rpe: int = 0,
    tool_context=None,
) -> dict:
    """Log a single exercise set to the current workout session.

    Args:
        exercise_id: UUID of the exercise.
        set_number: Set number (1-based).
        weight_kg: Weight used in kilograms.
        reps: Number of repetitions completed.
        rpe: Rate of perceived exertion (0-10).

    Returns confirmation or error.
    """
    user_id = tool_context.state["user_id"] if tool_context else None
    if not user_id:
        return {"error": "No user_id in session state"}

    try:
        sb = get_supabase()

        # Find today's active session
        session_result = (
            sb.table("sessions")
            .select("id")
            .eq("user_id", user_id)
            .eq("scheduled_date", date.today().isoformat())
            .is_("completed_at", "null")
            .limit(1)
            .execute()
        )
        if not session_result.data:
            return {"error": "No active workout session found for today"}

        session_id = session_result.data[0]["id"]

        payload = {
            "session_id": session_id,
            "exercise_id": exercise_id,
            "sets": [{"set_number": set_number, "weight": weight_kg, "reps": reps}],
            "rpe": rpe,
        }
        result = sb.table("exercise_logs").insert(payload).execute()
        row = result.data[0] if result.data else payload
        return {
            "logged": True,
            "exercise_id": exercise_id,
            "set_number": set_number,
            "weight_kg": weight_kg,
            "reps": reps,
            "log_id": row.get("id", ""),
            "suggested_widgets": [{
                "type": "metric-card",
                "title": "Set Registrado",
                "value": f"{weight_kg}kg x {reps}",
                "data": {"set_number": set_number, "rpe": rpe},
            }],
        }
    except Exception as exc:
        logger.error("log_exercise_set failed: %s", exc)
        return {"error": f"Could not log exercise set: {exc}"}


def get_personal_records(exercise_id: str = "", tool_context=None) -> dict:
    """Fetch personal records, optionally filtered by exercise.

    Args:
        exercise_id: Optional UUID to filter PRs for a specific exercise.

    Returns a list of personal records.
    """
    user_id = tool_context.state["user_id"] if tool_context else None
    if not user_id:
        return {"error": "No user_id in session state"}

    try:
        sb = get_supabase()
        q = (
            sb.table("personal_records")
            .select("*")
            .eq("user_id", user_id)
        )
        if exercise_id:
            q = q.eq("exercise_id", exercise_id)
        result = q.execute()
        records = result.data or []
        response = {"personal_records": records}
        if records:
            response["suggested_widgets"] = [
                {
                    "type": "metric-card",
                    "title": f"PR: {pr.get('exercise_name', 'Exercise')}",
                    "value": f"{pr.get('weight', 0)}kg",
                    "data": {"reps": pr.get("reps", 0)},
                }
                for pr in records[:3]
            ]
        return response
    except Exception as exc:
        logger.error("get_personal_records failed: %s", exc)
        return {"error": f"Could not fetch personal records: {exc}"}
