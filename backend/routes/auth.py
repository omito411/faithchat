# backend/routes/auth.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
from typing import Optional
import os, jwt

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Backend-issued JWT config
JWT_SECRET = os.getenv("JWT_SECRET", "change_me")
JWT_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "43200"))  # 30 days

# Supabase auth (Option B)
# Get this from Supabase Dashboard → Settings → API → "JWT secret"
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")

JWT_ALGO = "HS256"
# Allow a little clock skew so 'exp'/'iat' don't cause spurious failures
JWT_LEEWAY = int(os.getenv("JWT_CLOCK_LEEWAY", "10"))

# ---- Demo user store (replace with DB in prod) ----
USERS = {}

class RegisterInput(BaseModel):
    email: EmailStr
    password: str

class LoginInput(BaseModel):
    email: EmailStr
    password: str

def create_token(email: str) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": email,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=JWT_EXPIRE_MINUTES)).timestamp()),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)

@router.post("/register")
def register(data: RegisterInput):
    if data.email in USERS:
        raise HTTPException(status_code=400, detail="User already exists")
    USERS[data.email] = pwd_context.hash(data.password)
    token = create_token(data.email)
    return {"token": token}

@router.post("/login")
def login(data: LoginInput):
    hashed = USERS.get(data.email)
    if not hashed or not pwd_context.verify(data.password, hashed):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_token(data.email)
    return {"token": token}

# ---- Token validation (accept backend JWT or Supabase access token) ----

def _decode(token: str, secret: str) -> dict:
    # Supabase tokens often set aud="authenticated" and don't require audience check here.
    return jwt.decode(
        token,
        secret,
        algorithms=[JWT_ALGO],
        options={"verify_aud": False},
        leeway=JWT_LEEWAY,
    )

def _extract_identity(claims: dict) -> Optional[str]:
    # Prefer email if present; fall back to sub
    return claims.get("email") or claims.get("sub")

def require_user(token: Optional[str]) -> str:
    if not token:
        raise HTTPException(status_code=401, detail="Missing token")

    # 1) Try backend-issued JWT
    try:
        claims = _decode(token, JWT_SECRET)
        ident = _extract_identity(claims)
        if ident:
            return ident
    except Exception:
        pass  # fall through to Supabase check

    # 2) Try Supabase access token (if configured)
    if SUPABASE_JWT_SECRET:
        try:
            claims = _decode(token, SUPABASE_JWT_SECRET)
            ident = _extract_identity(claims)
            if ident:
                return ident
            # If no email/sub, treat as invalid
            raise HTTPException(status_code=401, detail="Invalid token (no subject/email)")
        except Exception as e:
            # Surface why it failed (helps when debugging Railway logs)
            raise HTTPException(status_code=401, detail=f"Invalid token: {e}")

    # Neither secret worked
    raise HTTPException(status_code=401, detail="Invalid token")
