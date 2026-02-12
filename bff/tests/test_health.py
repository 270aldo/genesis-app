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
