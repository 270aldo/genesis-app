from unittest.mock import AsyncMock, patch


def test_chat_valid_request(client):
    with patch("routers.mobile.route_to_agent", new_callable=AsyncMock) as mock_route:
        mock_route.return_value = {
            "id": "resp-1",
            "response": "Hello!",
            "widgets": None,
            "conversation_id": None,
        }
        response = client.post("/mobile/chat", json={"message": "Hola"})
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert "response" in data


def test_chat_response_fields(client):
    with patch("routers.mobile.route_to_agent", new_callable=AsyncMock) as mock_route:
        mock_route.return_value = {
            "id": "r1",
            "response": "Test",
            "widgets": [],
            "conversation_id": "conv-1",
        }
        response = client.post(
            "/mobile/chat", json={"message": "Test", "agent_id": "train"}
        )
        data = response.json()
        assert data["response"] == "Test"
        assert data["conversation_id"] == "conv-1"


def test_chat_missing_message(client):
    response = client.post("/mobile/chat", json={})
    assert response.status_code == 422


def test_chat_routes_to_correct_agent(client):
    with patch("routers.mobile.route_to_agent", new_callable=AsyncMock) as mock_route:
        mock_route.return_value = {
            "id": "r1",
            "response": "Train response",
            "widgets": None,
            "conversation_id": None,
        }
        client.post(
            "/mobile/chat", json={"message": "Workout plan", "agent_id": "train"}
        )
        mock_route.assert_called_once_with(
            "train", "Workout plan", "test-user-123", None
        )
