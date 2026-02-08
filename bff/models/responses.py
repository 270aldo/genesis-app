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
