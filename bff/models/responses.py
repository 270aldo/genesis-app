from pydantic import BaseModel
from typing import Any


class WidgetPayload(BaseModel):
    id: str
    type: str
    title: str | None = None
    subtitle: str | None = None
    value: str | int | None = None
    data: dict[str, Any] | None = None


class ChatResponse(BaseModel):
    id: str
    response: str
    widgets: list[WidgetPayload] | None = None
    conversation_id: str | None = None


class ProfileResponse(BaseModel):
    profile: dict[str, Any]


class CheckInResponse(BaseModel):
    id: str
    date: str
    sleep_hours: float
    sleep_quality: int
    energy: int
    mood: int
    stress: int
    soreness: int
    nutrition_quality: int | None = None
    hydration: int | None = None
    notes: str | None = None
    created_at: str = ""


class SessionListResponse(BaseModel):
    sessions: list[dict[str, Any]]


class ExerciseLogResponse(BaseModel):
    id: str
    session_id: str
    exercise_id: str
    sets: list[dict]
    rpe: int
    notes: str | None = None
    created_at: str = ""


class TodayWorkoutResponse(BaseModel):
    session: dict[str, Any] | None = None


class TodayPlanExercise(BaseModel):
    exercise_id: str
    name: str
    sets: int
    reps: int
    rest_seconds: int
    order: int
    category: str | None = None
    muscle_groups: list[str] = []
    difficulty: str | None = None
    cues: list[str] = []


class TodayPlanResponse(BaseModel):
    plan: dict[str, Any] | None = None


class TrackStatsResponse(BaseModel):
    completed_workouts: int = 0
    total_prs: int = 0
    total_planned: int = 0


class StrengthDataPoint(BaseModel):
    label: str
    value: float
    active: bool = False


class StrengthProgressResponse(BaseModel):
    exercise_name: str
    data_points: list[StrengthDataPoint] = []
    change_percent: int = 0
