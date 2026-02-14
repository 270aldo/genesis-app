"""Profile-related tools for ADK agents.

Provides user profile, active season, and today's check-in data.
"""

import logging
from datetime import date

from services.supabase import get_supabase

logger = logging.getLogger(__name__)


def get_user_profile(tool_context=None) -> dict:
    """Fetch the current user's profile (name, experience level).

    Returns a dict with profile data or an error message.
    """
    user_id = tool_context.state["user_id"] if tool_context else None
    if not user_id:
        return {"error": "No user_id in session state"}

    try:
        sb = get_supabase()
        result = (
            sb.table("profiles")
            .select("full_name, experience_level, goals, created_at")
            .eq("id", user_id)
            .limit(1)
            .single()
            .execute()
        )
        data = result.data
        if not data:
            return {"error": "Profile not found"}
        return {
            "full_name": data.get("full_name", "Usuario"),
            "experience_level": data.get("experience_level", "intermedio"),
            "goals": data.get("goals", []),
            "member_since": data.get("created_at", ""),
        }
    except Exception as exc:
        logger.error("get_user_profile failed: %s", exc)
        return {"error": f"Could not fetch profile: {exc}"}


def get_current_season(tool_context=None) -> dict:
    """Fetch the user's active 12-week training season.

    Returns season metadata or an error/empty message.
    """
    user_id = tool_context.state["user_id"] if tool_context else None
    if not user_id:
        return {"error": "No user_id in session state"}

    try:
        sb = get_supabase()
        result = (
            sb.table("seasons")
            .select("id, name, status, start_date, end_date")
            .eq("user_id", user_id)
            .eq("status", "active")
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )
        if not result.data:
            return {"message": "No active season found"}
        s = result.data[0]
        return {
            "season_id": s.get("id"),
            "name": s.get("name", "Sin nombre"),
            "status": s.get("status"),
            "start_date": s.get("start_date"),
            "end_date": s.get("end_date"),
            "suggested_widgets": [{
                "type": "season-timeline",
                "title": s.get("name", "Season"),
                "data": {"status": s.get("status"), "start_date": s.get("start_date"), "end_date": s.get("end_date")},
            }],
        }
    except Exception as exc:
        logger.error("get_current_season failed: %s", exc)
        return {"error": f"Could not fetch season: {exc}"}


def get_today_checkin(tool_context=None) -> dict:
    """Fetch today's wellness check-in for the user.

    Returns check-in data (mood, energy, sleep) or a message if none exists.
    """
    user_id = tool_context.state["user_id"] if tool_context else None
    if not user_id:
        return {"error": "No user_id in session state"}

    try:
        sb = get_supabase()
        today_str = date.today().isoformat()
        result = (
            sb.table("check_ins")
            .select("mood, energy, sleep_hours, sleep_quality, stress, soreness")
            .eq("user_id", user_id)
            .eq("date", today_str)
            .limit(1)
            .execute()
        )
        if not result.data:
            return {"message": "No check-in recorded today"}
        ci = result.data[0]
        return {
            "mood": ci.get("mood"),
            "energy": ci.get("energy"),
            "sleep_hours": ci.get("sleep_hours"),
            "sleep_quality": ci.get("sleep_quality"),
            "stress": ci.get("stress"),
            "soreness": ci.get("soreness"),
            "suggested_widgets": [{
                "type": "today-card",
                "title": "Check-in de Hoy",
                "data": {"mood": ci.get("mood"), "energy": ci.get("energy"), "sleep_hours": ci.get("sleep_hours")},
            }],
        }
    except Exception as exc:
        logger.error("get_today_checkin failed: %s", exc)
        return {"error": f"Could not fetch check-in: {exc}"}
