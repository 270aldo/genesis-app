import os
import sys
import pytest
from unittest.mock import MagicMock

# Set required env vars BEFORE importing the app
os.environ.setdefault("SUPABASE_URL", "https://test.supabase.co")
os.environ.setdefault("SUPABASE_SERVICE_ROLE_KEY", "test-service-role-key")
os.environ.setdefault("SUPABASE_JWT_SECRET", "test-jwt-secret-for-testing-only-32chars!")
os.environ.setdefault("GCP_PROJECT_ID", "test-project")
os.environ.setdefault("GOOGLE_API_KEY", "test-api-key-for-gemini")

# Ensure bff/ is on sys.path so imports work
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))

# Workaround: google-adk 1.1.1 requires AudioTranscriptionConfig which is
# missing in google-genai 1.1.0. Patch it so tests can import the ADK.
from google.genai import types as _genai_types  # noqa: E402

if not hasattr(_genai_types, "AudioTranscriptionConfig"):
    from pydantic import BaseModel as _BM

    class _AudioTranscriptionConfig(_BM):
        pass

    _genai_types.AudioTranscriptionConfig = _AudioTranscriptionConfig  # type: ignore[attr-defined]

from fastapi.testclient import TestClient
from main import app
from services.auth import get_current_user_id


MOCK_USER_ID = "test-user-123"


def make_mock_supabase():
    """Create a mock Supabase client that chains methods properly."""
    mock = MagicMock()

    # Chain pattern: sb.table("x").select("y").eq("z", v).execute()
    chain = MagicMock()
    chain.execute.return_value = MagicMock(data=[], count=0)
    chain.select.return_value = chain
    chain.insert.return_value = chain
    chain.upsert.return_value = chain
    chain.update.return_value = chain
    chain.delete.return_value = chain
    chain.eq.return_value = chain
    chain.in_.return_value = chain
    chain.gte.return_value = chain
    chain.lte.return_value = chain
    chain.is_.return_value = chain
    chain.ilike.return_value = chain
    chain.contains.return_value = chain
    chain.filter.return_value = chain
    chain.order.return_value = chain
    chain.limit.return_value = chain
    chain.single.return_value = chain
    chain.maybe_single.return_value = chain

    mock.table.return_value = chain
    return mock, chain


@pytest.fixture
def mock_supabase():
    mock, chain = make_mock_supabase()
    return mock, chain


@pytest.fixture
def client(mock_supabase):
    from unittest.mock import patch

    mock, chain = mock_supabase

    app.dependency_overrides[get_current_user_id] = lambda: MOCK_USER_ID

    # Patch get_supabase where it's called in the router (plain function, not Depends)
    with patch("routers.mobile.get_supabase", return_value=mock):
        yield TestClient(app)

    app.dependency_overrides.clear()


@pytest.fixture
def auth_headers():
    """Generate a valid JWT for testing auth directly."""
    from jose import jwt
    import time

    payload = {
        "sub": MOCK_USER_ID,
        "aud": "authenticated",
        "exp": int(time.time()) + 3600,
        "iat": int(time.time()),
    }
    token = jwt.encode(payload, os.environ["SUPABASE_JWT_SECRET"], algorithm="HS256")
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def expired_token():
    """Generate an expired JWT."""
    from jose import jwt
    import time

    payload = {
        "sub": MOCK_USER_ID,
        "aud": "authenticated",
        "exp": int(time.time()) - 3600,
        "iat": int(time.time()) - 7200,
    }
    token = jwt.encode(payload, os.environ["SUPABASE_JWT_SECRET"], algorithm="HS256")
    return {"Authorization": f"Bearer {token}"}
