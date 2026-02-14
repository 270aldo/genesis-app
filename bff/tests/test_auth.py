import os
import time
from unittest.mock import MagicMock, patch

from fastapi.testclient import TestClient
from jose import jwt

from main import app
from services.auth import get_current_user_id


JWT_SECRET = os.environ["SUPABASE_JWT_SECRET"]
MOCK_USER_ID = "auth-test-user-456"


def _make_mock_supabase():
    mock_sb = MagicMock()
    chain = MagicMock()
    chain.execute.return_value = MagicMock(data=[], count=0)
    chain.select.return_value = chain
    chain.eq.return_value = chain
    chain.single.return_value = chain
    chain.order.return_value = chain
    chain.limit.return_value = chain
    chain.gte.return_value = chain
    chain.lte.return_value = chain
    chain.is_.return_value = chain
    chain.filter.return_value = chain
    chain.maybe_single.return_value = chain
    mock_sb.table.return_value = chain
    return mock_sb


def _make_token(sub=MOCK_USER_ID, aud="authenticated", exp_offset=3600):
    payload = {
        "sub": sub,
        "aud": aud,
        "exp": int(time.time()) + exp_offset,
        "iat": int(time.time()),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


def _make_auth_client():
    """Client without auth override -- tests real auth flow."""
    mock_sb = _make_mock_supabase()

    # Do NOT override get_current_user_id so real auth runs
    app.dependency_overrides.pop(get_current_user_id, None)

    client = TestClient(app)
    return client, mock_sb


def test_valid_jwt_passes():
    with patch("routers.mobile.get_supabase", return_value=_make_mock_supabase()):
        client, _ = _make_auth_client()
        token = _make_token()
        response = client.get(
            "/mobile/meals", headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
    app.dependency_overrides.clear()


def test_expired_jwt_returns_401():
    with patch("routers.mobile.get_supabase", return_value=_make_mock_supabase()):
        client, _ = _make_auth_client()
        token = _make_token(exp_offset=-3600)
        response = client.get(
            "/mobile/meals", headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 401
        assert response.json()["detail"]["reason"] == "expired"
    app.dependency_overrides.clear()


def test_invalid_jwt_returns_401():
    with patch("routers.mobile.get_supabase", return_value=_make_mock_supabase()):
        client, _ = _make_auth_client()
        response = client.get(
            "/mobile/meals",
            headers={"Authorization": "Bearer invalid.token.here"},
        )
        assert response.status_code == 401
        assert response.json()["detail"]["reason"] == "invalid"
    app.dependency_overrides.clear()


def test_missing_auth_header_returns_401():
    with patch("routers.mobile.get_supabase", return_value=_make_mock_supabase()):
        client, _ = _make_auth_client()
        response = client.get("/mobile/meals")
        assert response.status_code == 401
        assert response.json()["detail"]["reason"] == "missing_token"
    app.dependency_overrides.clear()
