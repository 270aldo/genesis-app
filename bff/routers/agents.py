from fastapi import APIRouter

router = APIRouter()


@router.get("/status")
async def agent_status():
    return {"agents": ["genesis", "train", "fuel", "mind", "track", "vision", "coach_bridge"], "status": "stubs"}
