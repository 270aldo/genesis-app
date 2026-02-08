import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from routers import mobile, agents  # noqa: E402

app = FastAPI(title="GENESIS BFF", version="1.0.0")

cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:8081").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(mobile.router, prefix="/mobile", tags=["mobile"])
app.include_router(agents.router, prefix="/agents", tags=["agents"])


@app.get("/health")
async def health():
    return {"status": "ok", "service": "genesis-bff"}
