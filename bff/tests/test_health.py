def test_health_returns_200(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "service" in data
    assert "checks" in data


def test_health_service_name(client):
    response = client.get("/health")
    assert response.json()["service"] == "genesis-bff"


def test_health_has_gemini_check(client):
    response = client.get("/health")
    checks = response.json()["checks"]
    assert "gemini_configured" in checks


def test_health_has_adk_available(client):
    response = client.get("/health")
    checks = response.json()["checks"]
    assert "adk_available" in checks


def test_health_has_session_type(client):
    response = client.get("/health")
    checks = response.json()["checks"]
    assert "session_type" in checks
    assert checks["session_type"] in ("database", "in_memory", "none")


def test_health_gemini_check_uses_api_key(client):
    """Verify gemini_configured checks GOOGLE_API_KEY, not GCP_PROJECT_ID."""
    response = client.get("/health")
    checks = response.json()["checks"]
    # conftest sets GOOGLE_API_KEY=test-api-key-for-gemini, so this should be True
    assert checks["gemini_configured"] is True
