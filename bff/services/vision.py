"""Vision service — food scanning & equipment detection via Gemini."""

import os
import json
import base64
import logging

from google import genai
from google.genai import types

logger = logging.getLogger(__name__)

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "")

_client: genai.Client | None = None

VISION_MODEL = "gemini-2.0-flash"


def _get_client() -> genai.Client:
    """Lazy-initialise the Gemini client using API key auth."""
    global _client
    if _client is None:
        if not GOOGLE_API_KEY:
            raise ValueError("GOOGLE_API_KEY not configured")
        _client = genai.Client(api_key=GOOGLE_API_KEY)
    return _client


def _strip_markdown_fences(text: str) -> str:
    """Remove ```json ... ``` wrappers that Gemini sometimes adds."""
    text = text.strip()
    if text.startswith("```"):
        # Remove first line (```json or ```)
        first_newline = text.index("\n")
        text = text[first_newline + 1 :]
    if text.endswith("```"):
        text = text[: -3]
    return text.strip()


async def scan_food(image_base64: str) -> dict:
    """Detect food items and estimate macros from a base64-encoded image.

    Returns a dict with keys:
        detectedItems: list[{name: str, confidence: float}]
        estimatedCalories: int
        estimatedProtein: int | None
        estimatedCarbs: int | None
        estimatedFat: int | None
    """
    try:
        client = _get_client()

        prompt = (
            "Analiza esta imagen de comida. Identifica cada alimento visible y estima sus macros.\n\n"
            "Responde SOLO con JSON valido (sin markdown, sin explicaciones), con esta estructura:\n"
            "{\n"
            '  "detectedItems": [{"name": "nombre del alimento en espanol", "confidence": 0.0-1.0}],\n'
            '  "estimatedCalories": numero_entero,\n'
            '  "estimatedProtein": numero_entero_gramos,\n'
            '  "estimatedCarbs": numero_entero_gramos,\n'
            '  "estimatedFat": numero_entero_gramos\n'
            "}\n\n"
            "Si no puedes identificar comida, devuelve detectedItems vacio y calorias 0."
        )

        image_bytes = base64.b64decode(image_base64)

        image_part = types.Part.from_bytes(data=image_bytes, mime_type="image/jpeg")
        text_part = types.Part.from_text(text=prompt)

        response = client.models.generate_content(
            model=VISION_MODEL,
            contents=[types.Content(role="user", parts=[image_part, text_part])],
            config=types.GenerateContentConfig(temperature=0.3, max_output_tokens=512),
        )

        raw = response.text or ""
        cleaned = _strip_markdown_fences(raw)
        result = json.loads(cleaned)
        return {
            "detectedItems": result.get("detectedItems", []),
            "estimatedCalories": result.get("estimatedCalories", 0),
            "estimatedProtein": result.get("estimatedProtein"),
            "estimatedCarbs": result.get("estimatedCarbs"),
            "estimatedFat": result.get("estimatedFat"),
        }
    except json.JSONDecodeError:
        logger.warning("Gemini food scan returned unparseable JSON: %s", raw if "raw" in dir() else "N/A")
        return {
            "detectedItems": [],
            "estimatedCalories": 0,
            "estimatedProtein": None,
            "estimatedCarbs": None,
            "estimatedFat": None,
        }
    except Exception:
        logger.exception("scan_food failed")
        return {
            "detectedItems": [],
            "estimatedCalories": 0,
            "estimatedProtein": None,
            "estimatedCarbs": None,
            "estimatedFat": None,
        }


async def detect_equipment(image_base64: str) -> dict:
    """Detect gym equipment from a base64-encoded image.

    Returns a dict with key:
        detectedEquipment: list[{name: str, confidence: float}]
    """
    try:
        client = _get_client()

        prompt = (
            "Analiza esta imagen y detecta todo el equipamiento de gimnasio visible.\n\n"
            "Responde SOLO con JSON valido (sin markdown, sin explicaciones), con esta estructura:\n"
            "{\n"
            '  "detectedEquipment": [{"name": "nombre del equipo en espanol", "confidence": 0.0-1.0}]\n'
            "}\n\n"
            "Si no puedes identificar equipamiento, devuelve detectedEquipment vacio."
        )

        image_bytes = base64.b64decode(image_base64)

        image_part = types.Part.from_bytes(data=image_bytes, mime_type="image/jpeg")
        text_part = types.Part.from_text(text=prompt)

        response = client.models.generate_content(
            model=VISION_MODEL,
            contents=[types.Content(role="user", parts=[image_part, text_part])],
            config=types.GenerateContentConfig(temperature=0.3, max_output_tokens=512),
        )

        raw = response.text or ""
        cleaned = _strip_markdown_fences(raw)
        result = json.loads(cleaned)
        return {
            "detectedEquipment": result.get("detectedEquipment", []),
        }
    except json.JSONDecodeError:
        logger.warning("Gemini equipment scan returned unparseable JSON: %s", raw if "raw" in dir() else "N/A")
        return {"detectedEquipment": []}
    except Exception:
        logger.exception("detect_equipment failed")
        return {"detectedEquipment": []}
