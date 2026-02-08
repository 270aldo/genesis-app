import os
from fastapi import HTTPException, Request
from jose import jwt, JWTError

JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")
if not JWT_SECRET:
    import warnings
    warnings.warn("SUPABASE_JWT_SECRET not set — auth will reject all requests")
    JWT_SECRET = "not-configured"
JWT_ALGORITHM = "HS256"


async def get_current_user_id(request: Request) -> str:
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    token = auth_header[7:]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM], audience="authenticated")
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token: no subject")
        return user_id
    except JWTError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {e}")
