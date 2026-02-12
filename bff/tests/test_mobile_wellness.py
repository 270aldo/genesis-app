def test_post_check_in(client, mock_supabase):
    _, chain = mock_supabase
    chain.execute.return_value.data = [
        {"id": "ci1", "created_at": "2026-02-11T00:00:00"}
    ]
    response = client.post(
        "/mobile/check-in",
        json={
            "date": "2026-02-11",
            "sleep_hours": 7.5,
            "sleep_quality": 3,
            "energy": 7,
            "mood": 4,
            "stress": 3,
            "soreness": 2,
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["sleep_hours"] == 7.5


def test_track_stats(client, mock_supabase):
    _, chain = mock_supabase
    chain.execute.return_value.data = []
    chain.execute.return_value.count = 0
    response = client.get("/mobile/track/stats")
    assert response.status_code == 200
    data = response.json()
    assert "completed_workouts" in data
    assert "total_planned" in data


def test_strength_progress(client, mock_supabase):
    _, chain = mock_supabase
    chain.execute.return_value.data = []
    response = client.get("/mobile/track/strength-progress")
    assert response.status_code == 200
    data = response.json()
    assert "exercise_name" in data
    assert "data_points" in data
    assert "change_percent" in data
