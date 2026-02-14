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


# -- Sprint 4: Cache & Knowledge checks --


def test_health_has_cache_stats(client):
    """Health endpoint should include cache stats."""
    response = client.get("/health")
    checks = response.json()["checks"]
    assert "cache_stats" in checks
    stats = checks["cache_stats"]
    assert "l1_hits" in stats
    assert "l2_hits" in stats
    assert "l1_size" in stats


def test_health_has_knowledge_stores(client):
    """Health endpoint should include knowledge store configuration status."""
    response = client.get("/health")
    checks = response.json()["checks"]
    assert "knowledge_stores" in checks
    stores = checks["knowledge_stores"]
    assert "genesis" in stores
    assert "train" in stores
    assert "fuel" in stores
    assert "mind" in stores
    assert "track" in stores
