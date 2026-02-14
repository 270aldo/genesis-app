from pydantic import BaseModel, field_validator


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


class ExerciseSetData(BaseModel):
    set_number: int
    reps: int
    weight: float = 0
    rpe: int | None = None


class ExerciseLogRequest(BaseModel):
    session_id: str
    exercise_id: str
    sets: list[ExerciseSetData]
    rpe: int = 0
    notes: str | None = None


class FoodItem(BaseModel):
    name: str
    quantity: float = 1.0
    unit: str = "g"
    calories: float = 0
    protein: float = 0
    carbs: float = 0
    fat: float = 0


class TotalMacros(BaseModel):
    calories: float = 0
    protein: float = 0
    carbs: float = 0
    fat: float = 0
    fiber: float = 0


class MealLogRequest(BaseModel):
    date: str
    meal_type: str
    food_items: list[FoodItem] = []
    total_macros: TotalMacros = TotalMacros()


class WaterLogRequest(BaseModel):
    date: str
    glasses: int


class VisionScanRequest(BaseModel):
    imageBase64: str
    mode: str = "food"

    @field_validator("imageBase64")
    @classmethod
    def validate_base64_size(cls, v: str) -> str:
        # ~5.5MB base64 ≈ ~4MB raw image — generous limit for phone photos
        max_length = 5_500_000
        if len(v) > max_length:
            raise ValueError(f"Image too large: {len(v)} chars exceeds {max_length} limit")
        return v
