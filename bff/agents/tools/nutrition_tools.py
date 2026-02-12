"""Nutrition-related tools for ADK agents.

Provides meal tracking, water intake, and macro logging capabilities.
"""

import logging
from datetime import date

from services.supabase import get_supabase

logger = logging.getLogger(__name__)


def get_today_meals(tool_context=None) -> dict:
    """Fetch all meals logged today for the current user.

    Returns a list of meals with macro data.
    """
    user_id = tool_context.state["user_id"] if tool_context else None
    if not user_id:
        return {"error": "No user_id in session state"}

    try:
        sb = get_supabase()
        result = (
            sb.table("meals")
            .select("*")
            .eq("user_id", user_id)
            .eq("date", date.today().isoformat())
            .order("logged_at", desc=False)
            .execute()
        )
        meals = result.data or []
        response = {"meals": meals}
        if meals:
            total_cal = sum(
                (m.get("total_macros") or {}).get("calories", 0) for m in meals
            )
            response["suggested_widgets"] = [{
                "type": "meal-plan",
                "title": "Comidas de Hoy",
                "value": f"{total_cal} kcal",
                "data": {"meal_count": len(meals)},
            }]
        return response
    except Exception as exc:
        logger.error("get_today_meals failed: %s", exc)
        return {"error": f"Could not fetch meals: {exc}"}


def log_meal(
    meal_type: str,
    food_items: list[dict],
    total_calories: int,
    protein: int,
    carbs: int,
    fat: int,
    tool_context=None,
) -> dict:
    """Log a meal with food items and macros.

    Args:
        meal_type: One of "breakfast", "lunch", "dinner", "snack".
        food_items: List of dicts with "name" and optionally "calories", "protein", etc.
        total_calories: Total estimated calories for the meal.
        protein: Total protein in grams.
        carbs: Total carbs in grams.
        fat: Total fat in grams.

    Returns confirmation or error.
    """
    user_id = tool_context.state["user_id"] if tool_context else None
    if not user_id:
        return {"error": "No user_id in session state"}

    try:
        sb = get_supabase()
        payload = {
            "user_id": user_id,
            "date": date.today().isoformat(),
            "meal_type": meal_type,
            "food_items": food_items,
            "total_macros": {
                "calories": total_calories,
                "protein": protein,
                "carbs": carbs,
                "fat": fat,
            },
        }
        result = sb.table("meals").insert(payload).execute()
        row = result.data[0] if result.data else payload
        return {
            "logged": True,
            "meal_type": meal_type,
            "total_calories": total_calories,
            "meal_id": row.get("id", ""),
            "suggested_widgets": [{
                "type": "insight-card",
                "title": "Comida Registrada",
                "value": f"{total_calories} kcal",
                "data": {"meal_type": meal_type, "protein": protein, "carbs": carbs, "fat": fat},
            }],
        }
    except Exception as exc:
        logger.error("log_meal failed: %s", exc)
        return {"error": f"Could not log meal: {exc}"}


def get_water_intake(tool_context=None) -> dict:
    """Fetch today's water intake (in glasses) for the current user.

    Returns the number of glasses logged today.
    """
    user_id = tool_context.state["user_id"] if tool_context else None
    if not user_id:
        return {"error": "No user_id in session state"}

    try:
        sb = get_supabase()
        result = (
            sb.table("water_logs")
            .select("*")
            .eq("user_id", user_id)
            .eq("date", date.today().isoformat())
            .maybe_single()
            .execute()
        )
        glasses = result.data.get("glasses", 0) if result.data else 0
        return {
            "glasses": glasses,
            "date": date.today().isoformat(),
            "suggested_widgets": [{
                "type": "hydration-tracker",
                "title": "Hidratación",
                "value": f"{glasses} vasos",
                "data": {"glasses": glasses, "goal": 8},
            }],
        }
    except Exception as exc:
        logger.error("get_water_intake failed: %s", exc)
        return {"error": f"Could not fetch water intake: {exc}"}


def log_water(glasses: int = 1, tool_context=None) -> dict:
    """Log water intake (upsert today's total).

    Args:
        glasses: Total number of glasses to set for today.

    Returns confirmation with updated total.
    """
    user_id = tool_context.state["user_id"] if tool_context else None
    if not user_id:
        return {"error": "No user_id in session state"}

    try:
        sb = get_supabase()
        result = (
            sb.table("water_logs")
            .upsert(
                {
                    "user_id": user_id,
                    "date": date.today().isoformat(),
                    "glasses": glasses,
                },
                on_conflict="user_id,date",
            )
            .execute()
        )
        row = result.data[0] if result.data else {"glasses": glasses}
        return {
            "logged": True,
            "glasses": row.get("glasses", glasses),
            "suggested_widgets": [{
                "type": "hydration-tracker",
                "title": "Agua Actualizada",
                "value": f"{row.get('glasses', glasses)} vasos",
                "data": {"glasses": row.get("glasses", glasses), "goal": 8},
            }],
        }
    except Exception as exc:
        logger.error("log_water failed: %s", exc)
        return {"error": f"Could not log water: {exc}"}
