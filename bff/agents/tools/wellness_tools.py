"""Wellness-related tools for ADK agents.

Provides check-in submission and wellness trend analysis.
"""

import logging
from datetime import date, timedelta

from services.supabase import get_supabase

logger = logging.getLogger(__name__)


def submit_check_in(
    mood: int,
    energy: int,
    sleep_hours: float,
    sleep_quality: int,
    stress: int,
    soreness: int,
    tool_context=None,
) -> dict:
    """Submit or update today's wellness check-in.

    Args:
        mood: Mood score 1-10.
        energy: Energy score 1-10.
        sleep_hours: Hours of sleep (e.g. 7.5).
        sleep_quality: Sleep quality 1-10.
        stress: Stress level 1-10.
        soreness: Muscle soreness level 1-10.

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
            "mood": mood,
            "energy": energy,
            "sleep_hours": sleep_hours,
            "sleep_quality": sleep_quality,
            "stress": stress,
            "soreness": soreness,
        }
        result = sb.table("check_ins").upsert(payload, on_conflict="user_id,date").execute()
        row = result.data[0] if result.data else payload
        return {
            "submitted": True,
            "date": date.today().isoformat(),
            "check_in_id": row.get("id", ""),
        }
    except Exception as exc:
        logger.error("submit_check_in failed: %s", exc)
        return {"error": f"Could not submit check-in: {exc}"}


def get_wellness_trends(days: int = 7, tool_context=None) -> dict:
    """Fetch wellness trends over the last N days.

    Args:
        days: Number of days to look back (default 7).

    Returns averages for mood, energy, sleep, stress, and soreness,
    plus the individual data points.
    """
    user_id = tool_context.state["user_id"] if tool_context else None
    if not user_id:
        return {"error": "No user_id in session state"}

    try:
        sb = get_supabase()
        start_date = (date.today() - timedelta(days=days)).isoformat()
        result = (
            sb.table("check_ins")
            .select("date, mood, energy, sleep_hours, sleep_quality, stress, soreness")
            .eq("user_id", user_id)
            .gte("date", start_date)
            .order("date", desc=False)
            .execute()
        )
        data = result.data or []
        if not data:
            return {"message": f"No check-in data in the last {days} days", "data_points": []}

        # Compute averages
        count = len(data)
        avg_mood = round(sum(d.get("mood", 0) for d in data) / count, 1)
        avg_energy = round(sum(d.get("energy", 0) for d in data) / count, 1)
        avg_sleep = round(sum(d.get("sleep_hours", 0) for d in data) / count, 1)
        avg_stress = round(sum(d.get("stress", 0) for d in data) / count, 1)
        avg_soreness = round(sum(d.get("soreness", 0) for d in data) / count, 1)

        return {
            "days": days,
            "data_points": data,
            "averages": {
                "mood": avg_mood,
                "energy": avg_energy,
                "sleep_hours": avg_sleep,
                "stress": avg_stress,
                "soreness": avg_soreness,
            },
        }
    except Exception as exc:
        logger.error("get_wellness_trends failed: %s", exc)
        return {"error": f"Could not fetch wellness trends: {exc}"}
