from unittest.mock import MagicMock


def test_post_meal(client, mock_supabase):
    _, chain = mock_supabase
    chain.execute.return_value.data = [
        {"id": "m1", "date": "2026-02-11", "meal_type": "lunch"}
    ]
    response = client.post(
        "/mobile/meals",
        json={
            "date": "2026-02-11",
            "meal_type": "lunch",
            "food_items": [
                {
                    "name": "Chicken",
                    "calories": 300,
                    "protein": 40,
                    "carbs": 0,
                    "fat": 10,
                }
            ],
            "total_macros": {
                "calories": 300,
                "protein": 40,
                "carbs": 0,
                "fat": 10,
            },
        },
    )
    assert response.status_code == 200


def test_get_meals(client, mock_supabase):
    _, chain = mock_supabase
    chain.execute.return_value.data = []
    response = client.get("/mobile/meals")
    assert response.status_code == 200
    assert "meals" in response.json()


def test_post_water(client, mock_supabase):
    _, chain = mock_supabase
    chain.execute.return_value.data = [{"glasses": 5}]
    response = client.post(
        "/mobile/water", json={"date": "2026-02-11", "glasses": 5}
    )
    assert response.status_code == 200


def test_get_water(client, mock_supabase):
    _, chain = mock_supabase
    chain.execute.return_value = MagicMock(data={"glasses": 3})
    response = client.get("/mobile/water")
    assert response.status_code == 200
    assert "glasses" in response.json()


def test_post_meal_invalid(client):
    response = client.post("/mobile/meals", json={"meal_type": "lunch"})
    assert response.status_code == 422
