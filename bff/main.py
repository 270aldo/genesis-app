import os
import time
import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
)
logger = logging.getLogger(__name__)

from routers import mobile, agents  # noqa: E402
from services.supabase import check_supabase_health  # noqa: E402
from services.agent_router import _adk_available, _session_type  # noqa: E402

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


@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    elapsed_ms = (time.time() - start) * 1000
    logger.info("%s %s -> %s (%.0fms)", request.method, request.url.path, response.status_code, elapsed_ms)
    return response


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled exception on %s %s", request.method, request.url.path)
    return JSONResponse(
        status_code=500,
        content={"error": "internal_server_error", "type": type(exc).__name__},
    )


@app.get("/health")
async def health():
    checks = {
        "supabase": check_supabase_health(),
        "gemini_configured": bool(os.getenv("GOOGLE_API_KEY")),
        "adk_available": _adk_available,
        "session_type": _session_type,
    }
    status = "ok" if checks["supabase"] and checks["gemini_configured"] else "degraded"
    return {"status": status, "service": "genesis-bff", "checks": checks}
