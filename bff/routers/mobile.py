from fastapi import APIRouter, Depends
from models.requests import ChatRequest, CheckInRequest, ExerciseLogRequest, MealLogRequest, WaterLogRequest, VisionScanRequest
from models.responses import ChatResponse, ProfileResponse, SessionListResponse, CheckInResponse, ExerciseLogResponse, TodayWorkoutResponse, TodayPlanResponse, TrackStatsResponse, StrengthProgressResponse, MealResponse, WaterResponse, ExerciseListResponse, EducationListResponse, VisionFoodScanResponse, VisionEquipmentResponse
from services.auth import get_current_user_id
from services.supabase import get_supabase
from services.agent_router import route_to_agent

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest, user_id: str = Depends(get_current_user_id)):
    result = await route_to_agent(req.agent_id or "genesis", req.message, user_id, req.conversation_id)
    return result


@router.get("/profile", response_model=ProfileResponse)
async def get_profile(user_id: str = Depends(get_current_user_id)):
    sb = get_supabase()
    result = sb.table("profiles").select("*").eq("id", user_id).single().execute()
    data = result.data or {}
    return ProfileResponse(
        profile={
            "id": user_id,
            "email": data.get("email", ""),
            "name": data.get("full_name", ""),
            "plan": "hybrid",
            "subscriptionStatus": "active",
        }
    )


@router.post("/check-in", response_model=CheckInResponse)
async def create_check_in(req: CheckInRequest, user_id: str = Depends(get_current_user_id)):
    sb = get_supabase()
    payload = {
        "user_id": user_id,
        "date": req.date,
        "sleep_hours": req.sleep_hours,
        "sleep_quality": req.sleep_quality,
        "energy": req.energy,
        "mood": req.mood,
        "stress": req.stress,
        "soreness": req.soreness,
        "nutrition_quality": req.nutrition_quality,
        "hydration": req.hydration,
        "notes": req.notes,
    }
    result = sb.table("check_ins").upsert(payload, on_conflict="user_id,date").execute()
    row = result.data[0] if result.data else payload
    return CheckInResponse(id=row.get("id", ""), created_at=row.get("created_at", ""), **{k: v for k, v in payload.items() if k != "user_id"})


@router.get("/sessions", response_model=SessionListResponse)
async def get_sessions(user_id: str = Depends(get_current_user_id), from_date: str | None = None, to_date: str | None = None):
    sb = get_supabase()
    query = sb.table("sessions").select("*, exercise_logs(*)").eq("user_id", user_id).order("scheduled_date", desc=True).limit(20)
    if from_date:
        query = query.gte("scheduled_date", from_date)
    if to_date:
        query = query.lte("scheduled_date", to_date)
    result = query.execute()
    return SessionListResponse(sessions=result.data or [])


@router.post("/exercise-log", response_model=ExerciseLogResponse)
async def log_exercise(req: ExerciseLogRequest, user_id: str = Depends(get_current_user_id)):
    sb = get_supabase()
    payload = {
        "session_id": req.session_id,
        "exercise_id": req.exercise_id,
        "sets": req.sets,
        "rpe": req.rpe,
        "notes": req.notes,
    }
    result = sb.table("exercise_logs").insert(payload).execute()
    row = result.data[0] if result.data else payload
    return ExerciseLogResponse(id=row.get("id", ""), created_at=row.get("created_at", ""), **payload)


@router.get("/workout/today", response_model=TodayWorkoutResponse)
async def get_today_workout(user_id: str = Depends(get_current_user_id)):
    from datetime import date
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
    return TodayWorkoutResponse(session=session)


@router.get("/training/today", response_model=TodayPlanResponse)
async def get_today_plan(user_id: str = Depends(get_current_user_id)):
    from datetime import date
    sb = get_supabase()

    # 1. Get active season
    season_result = (
        sb.table("seasons")
        .select("id")
        .eq("user_id", user_id)
        .eq("status", "active")
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )
    if not season_result.data:
        return TodayPlanResponse(plan=None)
    season_id = season_result.data[0]["id"]

    # 2. Find current phase (today between start_date and end_date)
    today_str = date.today().isoformat()
    phase_result = (
        sb.table("phases")
        .select("id, name, focus")
        .eq("season_id", season_id)
        .lte("start_date", today_str)
        .gte("end_date", today_str)
        .limit(1)
        .execute()
    )
    if not phase_result.data:
        return TodayPlanResponse(plan=None)
    phase = phase_result.data[0]

    # 3. Find weekly_plan for today's day_of_week (0=Mon...6=Sun)
    dow = date.today().weekday()
    plan_result = (
        sb.table("weekly_plans")
        .select("*")
        .eq("phase_id", phase["id"])
        .eq("day_of_week", dow)
        .limit(1)
        .execute()
    )
    if not plan_result.data:
        return TodayPlanResponse(plan=None)
    weekly_plan = plan_result.data[0]

    # 4. Fetch exercise details for all exercise_ids in the plan
    exercise_entries = weekly_plan.get("exercises", [])
    exercise_ids = [e["exercise_id"] for e in exercise_entries if "exercise_id" in e]

    exercises_with_details = []
    if exercise_ids:
        ex_result = (
            sb.table("exercises")
            .select("id, name, category, muscle_groups, difficulty, cues")
            .in_("id", exercise_ids)
            .execute()
        )
        ex_map = {e["id"]: e for e in (ex_result.data or [])}

        for entry in exercise_entries:
            eid = entry.get("exercise_id", "")
            detail = ex_map.get(eid, {})
            exercises_with_details.append({
                "exercise_id": eid,
                "name": detail.get("name", "Unknown"),
                "sets": entry.get("sets", 4),
                "reps": entry.get("reps", 10),
                "rest_seconds": entry.get("rest_seconds", 75),
                "order": entry.get("order", 0),
                "category": detail.get("category"),
                "muscle_groups": detail.get("muscle_groups", []),
                "difficulty": detail.get("difficulty"),
                "cues": detail.get("cues", []),
            })

    # Sort by order
    exercises_with_details.sort(key=lambda x: x["order"])

    return TodayPlanResponse(plan={
        "name": weekly_plan["name"],
        "muscle_groups": weekly_plan.get("muscle_groups", []),
        "estimated_duration": weekly_plan.get("estimated_duration", 45),
        "exercises": exercises_with_details,
        "phase_focus": phase.get("focus"),
    })


@router.get("/track/stats", response_model=TrackStatsResponse)
async def get_track_stats(user_id: str = Depends(get_current_user_id)):
    """Season stats: completed workouts, total PRs, adherence."""
    sb = get_supabase()

    # Get active season date range
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
        return TrackStatsResponse(completed_workouts=0, total_prs=0, total_planned=0)

    season = season_result.data[0]

    # Count completed sessions in this season
    sessions_result = (
        sb.table("sessions")
        .select("id", count="exact")
        .eq("user_id", user_id)
        .gte("scheduled_date", season["start_date"])
        .lte("scheduled_date", season["end_date"])
        .filter("completed_at", "not.is", "null")
        .execute()
    )
    completed_workouts = sessions_result.count or 0

    # Count PRs
    prs_result = (
        sb.table("personal_records")
        .select("id", count="exact")
        .eq("user_id", user_id)
        .execute()
    )
    total_prs = prs_result.count or 0

    # Count total planned sessions from weekly_plans x season weeks
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
        total_planned = plans_per_week * 12  # simplified approx

    return TrackStatsResponse(
        completed_workouts=completed_workouts,
        total_prs=total_prs,
        total_planned=max(total_planned, completed_workouts),
    )


@router.get("/track/strength-progress", response_model=StrengthProgressResponse)
async def get_strength_progress(
    user_id: str = Depends(get_current_user_id),
    exercise_name: str | None = None,
):
    """Last 7 sessions' max weight for a specific exercise (or top exercise)."""
    from collections import defaultdict

    sb = get_supabase()

    # Get recent exercise logs with exercise details
    logs_result = (
        sb.table("exercise_logs")
        .select("sets, exercises(name), sessions!inner(user_id, completed_at, scheduled_date)")
        .eq("sessions.user_id", user_id)
        .filter("sessions.completed_at", "not.is", "null")
        .order("created_at", desc=True)
        .limit(50)
        .execute()
    )

    if not logs_result.data:
        return StrengthProgressResponse(
            exercise_name=exercise_name or "N/A", data_points=[], change_percent=0
        )

    # Group by exercise, find max weight per session
    exercise_sessions: dict[str, list[dict]] = defaultdict(list)

    for log in logs_result.data:
        ex_name = (log.get("exercises") or {}).get("name", "Unknown")
        sets_data = log.get("sets", [])
        if isinstance(sets_data, list):
            max_weight = max((s.get("weight", 0) for s in sets_data), default=0)
            sched_date = (log.get("sessions") or {}).get("scheduled_date", "")
            if max_weight > 0:
                exercise_sessions[ex_name].append({"date": sched_date, "weight": max_weight})

    # Pick the requested exercise or the one with most data
    target = exercise_name
    if not target or target not in exercise_sessions:
        target = max(exercise_sessions, key=lambda k: len(exercise_sessions[k]), default="N/A")

    points = exercise_sessions.get(target, [])
    # Sort by date ascending, take last 7
    points.sort(key=lambda x: x["date"])
    points = points[-7:]

    # Calculate change %
    change_percent = 0
    if len(points) >= 2 and points[0]["weight"] > 0:
        change_percent = round(
            ((points[-1]["weight"] - points[0]["weight"]) / points[0]["weight"]) * 100
        )

    data_points = [
        {"label": f"S{i+1}", "value": p["weight"], "active": i == len(points) - 1}
        for i, p in enumerate(points)
    ]

    return StrengthProgressResponse(
        exercise_name=target,
        data_points=data_points,
        change_percent=change_percent,
    )


@router.get("/meals", response_model=MealResponse)
async def get_meals(user_id: str = Depends(get_current_user_id), date: str | None = None):
    from datetime import date as date_type

    sb = get_supabase()
    target_date = date or date_type.today().isoformat()
    result = (
        sb.table("meals")
        .select("*")
        .eq("user_id", user_id)
        .eq("date", target_date)
        .order("logged_at", desc=False)
        .execute()
    )
    return MealResponse(meals=result.data or [])


@router.post("/meals")
async def log_meal(req: MealLogRequest, user_id: str = Depends(get_current_user_id)):
    sb = get_supabase()
    payload = {
        "user_id": user_id,
        "date": req.date,
        "meal_type": req.meal_type,
        "food_items": req.food_items,
        "total_macros": req.total_macros,
    }
    result = sb.table("meals").insert(payload).execute()
    row = result.data[0] if result.data else payload
    return row


@router.get("/water", response_model=WaterResponse)
async def get_water(user_id: str = Depends(get_current_user_id), date: str | None = None):
    from datetime import date as date_type

    sb = get_supabase()
    target_date = date or date_type.today().isoformat()
    result = (
        sb.table("water_logs")
        .select("*")
        .eq("user_id", user_id)
        .eq("date", target_date)
        .maybe_single()
        .execute()
    )
    return WaterResponse(glasses=result.data.get("glasses", 0) if result.data else 0)


@router.post("/water")
async def update_water(req: WaterLogRequest, user_id: str = Depends(get_current_user_id)):
    sb = get_supabase()
    result = (
        sb.table("water_logs")
        .upsert(
            {"user_id": user_id, "date": req.date, "glasses": req.glasses},
            on_conflict="user_id,date",
        )
        .execute()
    )
    row = result.data[0] if result.data else {"glasses": req.glasses}
    return row


@router.get("/exercises", response_model=ExerciseListResponse)
async def get_exercises(
    user_id: str = Depends(get_current_user_id),
    muscle_group: str | None = None,
    search: str | None = None,
):
    """Exercise catalog from the exercises table."""
    sb = get_supabase()
    query = sb.table("exercises").select("*").order("name")
    if muscle_group:
        query = query.contains("muscle_groups", [muscle_group])
    if search:
        query = query.ilike("name", f"%{search}%")
    result = query.limit(100).execute()
    return ExerciseListResponse(exercises=result.data or [])


@router.get("/education", response_model=EducationListResponse)
async def get_education(
    user_id: str = Depends(get_current_user_id),
    category: str | None = None,
):
    """List education articles, optionally filtered by category."""
    sb = get_supabase()
    query = sb.table("education_content").select("*").order("created_at", desc=True)
    if category:
        query = query.eq("category", category)
    result = query.execute()
    return EducationListResponse(articles=result.data or [])


@router.get("/education/{article_id}")
async def get_education_detail(article_id: str, user_id: str = Depends(get_current_user_id)):
    """Fetch a single education article by id."""
    sb = get_supabase()
    result = sb.table("education_content").select("*").eq("id", article_id).single().execute()
    return result.data


@router.post("/vision/scan-food", response_model=VisionFoodScanResponse)
async def vision_scan_food(req: VisionScanRequest, user_id: str = Depends(get_current_user_id)):
    """Analyze a food image and return detected items with estimated macros."""
    from services.vision import scan_food
    result = await scan_food(req.imageBase64)
    return VisionFoodScanResponse(**result)


@router.post("/vision/detect-equipment", response_model=VisionEquipmentResponse)
async def vision_detect_equipment(req: VisionScanRequest, user_id: str = Depends(get_current_user_id)):
    """Analyze an image and return detected gym equipment."""
    from services.vision import detect_equipment
    result = await detect_equipment(req.imageBase64)
    return VisionEquipmentResponse(**result)
