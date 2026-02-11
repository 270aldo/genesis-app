import os
import logging

from supabase import create_client, Client

logger = logging.getLogger(__name__)

_client: Client | None = None
_initialized = False


def get_supabase() -> Client:
    """Return the Supabase client, initialising on first call.

    Raises RuntimeError if env vars are missing so the caller
    can handle gracefully.
    """
    global _client, _initialized
    if _client is not None:
        return _client
    if _initialized:
        raise RuntimeError("Supabase init previously failed — env vars missing")

    _initialized = True
    url = os.getenv("SUPABASE_URL", "")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    if not url or not key:
        logger.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY — Supabase unavailable")
        raise RuntimeError("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
    _client = create_client(url, key)
    logger.info("Supabase client initialised for %s", url)
    return _client


def check_supabase_health() -> bool:
    """Quick health check — returns True if Supabase is reachable."""
    try:
        sb = get_supabase()
        sb.table("profiles").select("id").limit(1).execute()
        return True
    except Exception:
        logger.debug("Supabase health check failed", exc_info=True)
        return False
