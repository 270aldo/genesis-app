def test_get_today_workout(client, mock_supabase):
    _, chain = mock_supabase
    chain.execute.return_value.data = []
    response = client.get("/mobile/workout/today")
    assert response.status_code == 200
    assert "session" in response.json()


def test_get_exercises(client, mock_supabase):
    _, chain = mock_supabase
    chain.execute.return_value.data = [{"id": "ex1", "name": "Squat"}]
    response = client.get("/mobile/exercises")
    assert response.status_code == 200
    assert "exercises" in response.json()


def test_log_exercise_valid(client, mock_supabase):
    _, chain = mock_supabase
    chain.execute.return_value.data = [
        {"id": "log1", "created_at": "2026-02-11T00:00:00"}
    ]
    response = client.post(
        "/mobile/exercise-log",
        json={
            "session_id": "s1",
            "exercise_id": "ex1",
            "sets": [{"set_number": 1, "reps": 8, "weight": 80}],
            "rpe": 7,
        },
    )
    assert response.status_code == 200


def test_log_exercise_invalid(client):
    response = client.post("/mobile/exercise-log", json={"session_id": "s1"})
    assert response.status_code == 422
