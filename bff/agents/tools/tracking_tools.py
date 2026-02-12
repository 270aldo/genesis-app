"""Tracking/progress-related tools for ADK agents.

Provides season stats, strength progression, and period comparison.
"""

import logging

from services.supabase import get_supabase

logger = logging.getLogger(__name__)


def get_progress_stats(tool_context=None) -> dict:
    """Fetch season-level progress stats: completed workouts, PRs, adherence.

    Returns stats for the current active season.
    """
    user_id = tool_context.state["user_id"] if tool_context else None
    if not user_id:
        return {"error": "No user_id in session state"}

    try:
        sb = get_supabase()

        # Active season
        season_result = (
            sb.table("seasons")
            .select("id, start_date, end_date")
            .eq("user_id", user_id)
            .eq("status", "active")
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )
        if not season_result.data:
            return {"message": "No active season", "completed_workouts": 0, "total_prs": 0}

        season = season_result.data[0]

        # Completed sessions
        sessions_result = (
            sb.table("sessions")
            .select("id", count="exact")
            .eq("user_id", user_id)
            .gte("scheduled_date", season["start_date"])
            .lte("scheduled_date", season["end_date"])
            .filter("completed_at", "not.is", "null")
            .execute()
        )
        completed = sessions_result.count or 0

        # Total PRs
        prs_result = (
            sb.table("personal_records")
            .select("id", count="exact")
            .eq("user_id", user_id)
            .execute()
        )
        total_prs = prs_result.count or 0

        # Planned sessions (approximate)
        phases_result = (
            sb.table("phases")
            .select("id")
            .eq("season_id", season["id"])
            .execute()
        )
        phase_ids = [p["id"] for p in (phases_result.data or [])]
        total_planned = 0
        if phase_ids:
            plans_result = (
                sb.table("weekly_plans")
                .select("id", count="exact")
                .in_("phase_id", phase_ids)
                .execute()
            )
            plans_per_week = plans_result.count or 0
            total_planned = plans_per_week * 12

        return {
            "completed_workouts": completed,
            "total_prs": total_prs,
            "total_planned": max(total_planned, completed),
            "adherence_pct": round((completed / max(total_planned, 1)) * 100),
        }
    except Exception as exc:
        logger.error("get_progress_stats failed: %s", exc)
        return {"error": f"Could not fetch progress stats: {exc}"}


def get_strength_progress(exercise_id: str, tool_context=None) -> dict:
    """Fetch strength progression for a specific exercise over recent sessions.

    Args:
        exercise_id: UUID of the exercise to track.

    Returns data points with max weight per session and overall change %.
    """
    user_id = tool_context.state["user_id"] if tool_context else None
    if not user_id:
        return {"error": "No user_id in session state"}

    try:
        sb = get_supabase()
        logs_result = (
            sb.table("exercise_logs")
            .select("sets, exercises(name), sessions!inner(user_id, completed_at, scheduled_date)")
            .eq("sessions.user_id", user_id)
            .eq("exercise_id", exercise_id)
            .filter("sessions.completed_at", "not.is", "null")
            .order("created_at", desc=True)
            .limit(20)
            .execute()
        )
        if not logs_result.data:
            return {"exercise_id": exercise_id, "data_points": [], "change_percent": 0}

        # Extract max weight per session date
        date_weights: dict[str, float] = {}
        exercise_name = "Unknown"
        for log in logs_result.data:
            ex_info = log.get("exercises") or {}
            exercise_name = ex_info.get("name", exercise_name)
            sets_data = log.get("sets", [])
            sched_date = (log.get("sessions") or {}).get("scheduled_date", "")
            if isinstance(sets_data, list) and sched_date:
                max_w = max((s.get("weight", 0) for s in sets_data), default=0)
                if max_w > 0:
                    date_weights[sched_date] = max(date_weights.get(sched_date, 0), max_w)

        # Sort by date, take last 7
        sorted_dates = sorted(date_weights.keys())[-7:]
        points = [{"date": d, "weight": date_weights[d]} for d in sorted_dates]

        change_pct = 0
        if len(points) >= 2 and points[0]["weight"] > 0:
            change_pct = round(
                ((points[-1]["weight"] - points[0]["weight"]) / points[0]["weight"]) * 100
            )

        return {
            "exercise_name": exercise_name,
            "exercise_id": exercise_id,
            "data_points": points,
            "change_percent": change_pct,
        }
    except Exception as exc:
        logger.error("get_strength_progress failed: %s", exc)
        return {"error": f"Could not fetch strength progress: {exc}"}


def compare_periods(
    metric: str,
    period1_start: str,
    period1_end: str,
    period2_start: str,
    period2_end: str,
    tool_context=None,
) -> dict:
    """Compare a wellness metric across two date periods.

    Args:
        metric: Metric to compare ("mood", "energy", "sleep_hours", "stress", "soreness").
        period1_start: Start date of first period (YYYY-MM-DD).
        period1_end: End date of first period (YYYY-MM-DD).
        period2_start: Start date of second period (YYYY-MM-DD).
        period2_end: End date of second period (YYYY-MM-DD).

    Returns averages for each period and the delta.
    """
    user_id = tool_context.state["user_id"] if tool_context else None
    if not user_id:
        return {"error": "No user_id in session state"}

    valid_metrics = {"mood", "energy", "sleep_hours", "stress", "soreness"}
    if metric not in valid_metrics:
        return {"error": f"Invalid metric '{metric}'. Valid: {sorted(valid_metrics)}"}

    try:
        sb = get_supabase()

        # Period 1
        r1 = (
            sb.table("check_ins")
            .select(f"date, {metric}")
            .eq("user_id", user_id)
            .gte("date", period1_start)
            .lte("date", period1_end)
            .execute()
        )
        d1 = r1.data or []

        # Period 2
        r2 = (
            sb.table("check_ins")
            .select(f"date, {metric}")
            .eq("user_id", user_id)
            .gte("date", period2_start)
            .lte("date", period2_end)
            .execute()
        )
        d2 = r2.data or []

        def avg(data: list[dict]) -> float:
            vals = [d.get(metric, 0) for d in data if d.get(metric) is not None]
            return round(sum(vals) / max(len(vals), 1), 1)

        avg1 = avg(d1)
        avg2 = avg(d2)

        return {
            "metric": metric,
            "period1": {"start": period1_start, "end": period1_end, "avg": avg1, "count": len(d1)},
            "period2": {"start": period2_start, "end": period2_end, "avg": avg2, "count": len(d2)},
            "delta": round(avg2 - avg1, 1),
        }
    except Exception as exc:
        logger.error("compare_periods failed: %s", exc)
        return {"error": f"Could not compare periods: {exc}"}
