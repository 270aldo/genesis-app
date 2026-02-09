from pydantic import BaseModel


class ChatRequest(BaseModel):
    message: str
    agent_id: str | None = "genesis"
    conversation_id: str | None = None


class CheckInRequest(BaseModel):
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


class ExerciseLogRequest(BaseModel):
    session_id: str
    exercise_id: str
    sets: list[dict]
    rpe: int = 0
    notes: str | None = None


class MealLogRequest(BaseModel):
    date: str
    meal_type: str
    food_items: list[dict] = []
    total_macros: dict = {}


class WaterLogRequest(BaseModel):
    date: str
    glasses: int
