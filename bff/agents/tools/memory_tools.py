"""User memory tools for ADK agents.

Provides persistent memory storage and retrieval across conversations.
Allows GENESIS to remember user preferences, health facts, and insights.
"""

import logging

from services.supabase import get_supabase

logger = logging.getLogger(__name__)

VALID_CATEGORIES = (
    "preference",
    "health_fact",
    "training_insight",
    "nutrition_insight",
    "general",
)


def get_user_memories(category: str = "", tool_context=None) -> dict:
    """Fetch stored memories for the current user.

    Args:
        category: Optional category filter (preference, health_fact,
                  training_insight, nutrition_insight, general).

    Returns memories grouped by category or an error message.
    """
    user_id = tool_context.state["user_id"] if tool_context else None
    if not user_id:
        return {"error": "No user_id in session state"}

    try:
        sb = get_supabase()
        query = (
            sb.table("user_memory")
            .select("id, category, content, confidence, updated_at")
            .eq("user_id", user_id)
            .order("updated_at", desc=True)
            .limit(50)
        )

        if category and category in VALID_CATEGORIES:
            query = query.eq("category", category)

        result = query.execute()
        memories = result.data or []

        if not memories:
            return {"message": "No memories stored yet", "memories": []}

        # Group by category
        grouped: dict[str, list[dict]] = {}
        for m in memories:
            cat = m.get("category", "general")
            grouped.setdefault(cat, []).append({
                "content": m.get("content"),
                "confidence": m.get("confidence"),
                "updated_at": m.get("updated_at"),
            })

        return {
            "memories": grouped,
            "total": len(memories),
            "suggested_widgets": [{
                "type": "insight-card",
                "title": "Memoria de Usuario",
                "value": f"{len(memories)} recuerdos",
                "data": {"categories": list(grouped.keys())},
            }],
        }
    except Exception as exc:
        logger.error("get_user_memories failed: %s", exc)
        return {"error": f"Could not fetch memories: {exc}"}


def store_user_memory(
    category: str = "general",
    content: str = "",
    tool_context=None,
) -> dict:
    """Store a new memory about the user.

    Args:
        category: One of preference, health_fact, training_insight,
                  nutrition_insight, general.
        content: The memory content to store (min 5 chars).

    Returns confirmation or error.
    """
    user_id = tool_context.state["user_id"] if tool_context else None
    if not user_id:
        return {"error": "No user_id in session state"}

    if category not in VALID_CATEGORIES:
        return {"error": f"Invalid category '{category}'. Valid: {', '.join(VALID_CATEGORIES)}"}

    content = content.strip() if content else ""
    if len(content) < 5:
        return {"error": "Content too short (min 5 characters)"}

    try:
        sb = get_supabase()
        payload = {
            "user_id": user_id,
            "category": category,
            "content": content,
            "source": "conversation",
            "confidence": 1.0,
        }
        result = sb.table("user_memory").insert(payload).execute()
        row = result.data[0] if result.data else payload

        return {
            "stored": True,
            "memory_id": row.get("id", ""),
            "category": category,
            "suggested_widgets": [{
                "type": "coach-message",
                "title": "Memoria Guardada",
                "value": content[:60] + ("..." if len(content) > 60 else ""),
                "data": {"category": category},
            }],
        }
    except Exception as exc:
        logger.error("store_user_memory failed: %s", exc)
        return {"error": f"Could not store memory: {exc}"}
