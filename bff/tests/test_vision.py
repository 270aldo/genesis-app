from unittest.mock import AsyncMock, patch


def test_scan_food(client):
    with patch(
        "services.vision.scan_food", new_callable=AsyncMock
    ) as mock_scan:
        mock_scan.return_value = {
            "detectedItems": [{"name": "Rice", "confidence": 0.95}],
            "estimatedCalories": 250,
        }
        response = client.post(
            "/mobile/vision/scan-food",
            json={"imageBase64": "base64data", "mode": "food"},
        )
        assert response.status_code == 200
        data = response.json()
        assert "detectedItems" in data
        assert len(data["detectedItems"]) == 1


def test_detect_equipment(client):
    with patch(
        "services.vision.detect_equipment", new_callable=AsyncMock
    ) as mock_detect:
        mock_detect.return_value = {
            "detectedEquipment": [{"name": "Barbell", "confidence": 0.92}],
        }
        response = client.post(
            "/mobile/vision/detect-equipment",
            json={"imageBase64": "base64data"},
        )
        assert response.status_code == 200
        data = response.json()
        assert "detectedEquipment" in data


def test_scan_food_image_too_large(client):
    large_image = "x" * 6_000_000
    response = client.post(
        "/mobile/vision/scan-food",
        json={"imageBase64": large_image},
    )
    assert response.status_code == 422
