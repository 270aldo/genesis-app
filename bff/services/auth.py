import logging
import os

import httpx
from fastapi import HTTPException, Request
from jose import jwt, ExpiredSignatureError, JWTError, jwk

logger = logging.getLogger(__name__)

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
JWKS_URL = f"{SUPABASE_URL}/auth/v1/.well-known/jwks.json"

# Cache the JWKS keys in memory (refreshed on process restart)
_jwks_cache: dict | None = None


async def _get_jwks() -> dict:
    """Fetch and cache JWKS public keys from Supabase."""
    global _jwks_cache
    if _jwks_cache is not None:
        return _jwks_cache

    if not SUPABASE_URL:
        raise HTTPException(
            status_code=500,
            detail={"reason": "config", "message": "SUPABASE_URL not configured"},
        )

    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(JWKS_URL, timeout=10)
            resp.raise_for_status()
            _jwks_cache = resp.json()
            logger.info("Loaded JWKS from %s (%d keys)", JWKS_URL, len(_jwks_cache.get("keys", [])))
            return _jwks_cache
    except Exception as e:
        logger.error("Failed to fetch JWKS from %s: %s", JWKS_URL, e)
        raise HTTPException(
            status_code=500,
            detail={"reason": "config", "message": f"Cannot fetch JWKS: {e}"},
        )


def _find_key(jwks: dict, kid: str) -> dict | None:
    """Find a key in the JWKS by kid."""
    for key in jwks.get("keys", []):
        if key.get("kid") == kid:
            return key
    return None


async def get_current_user_id(request: Request) -> str:
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail={"reason": "missing_token", "message": "Missing or invalid Authorization header"},
        )
    token = auth_header[7:]

    if token.count(".") != 2:
        raise HTTPException(
            status_code=401,
            detail={"reason": "invalid", "message": "Token is not a valid JWT format"},
        )

    try:
        # Get the unverified header to find the kid and algorithm
        header = jwt.get_unverified_header(token)
        alg = header.get("alg", "")
        kid = header.get("kid", "")

        if alg == "ES256" and kid:
            # Asymmetric (ES256) — verify with JWKS public key
            jwks = await _get_jwks()
            key_data = _find_key(jwks, kid)
            if not key_data:
                # Clear cache and retry once (key might have rotated)
                global _jwks_cache
                _jwks_cache = None
                jwks = await _get_jwks()
                key_data = _find_key(jwks, kid)
            if not key_data:
                raise HTTPException(
                    status_code=401,
                    detail={"reason": "invalid", "message": f"Unknown signing key: {kid}"},
                )
            public_key = jwk.construct(key_data, algorithm="ES256")
            payload = jwt.decode(
                token, public_key, algorithms=["ES256"], audience="authenticated"
            )
        else:
            # Symmetric (HS256/HS384/HS512) — verify with shared secret
            jwt_secret = os.getenv("SUPABASE_JWT_SECRET", "not-configured")
            payload = jwt.decode(
                token, jwt_secret, algorithms=["HS256", "HS384", "HS512"], audience="authenticated"
            )

        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=401,
                detail={"reason": "invalid", "message": "Invalid token: no subject"},
            )
        return user_id

    except ExpiredSignatureError:
        raise HTTPException(
            status_code=401,
            detail={"reason": "expired", "message": "Token has expired — refresh and retry"},
        )
    except HTTPException:
        raise
    except JWTError as e:
        logger.warning("Auth JWT error: %s", e)
        raise HTTPException(
            status_code=401,
            detail={"reason": "invalid", "message": f"Invalid token: {e}"},
        )
