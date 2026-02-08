from fastapi import APIRouter, Depends
from models.requests import ChatRequest, CheckInRequest, ExerciseLogRequest
from models.responses import ChatResponse, ProfileResponse, SessionListResponse, CheckInResponse, ExerciseLogResponse, TodayWorkoutResponse
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
