# backend/routes/auth.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
from typing import Optional
import os, jwt, secrets

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# --- existing login JWT config ---
JWT_SECRET = os.getenv("JWT_SECRET", "change_me")
JWT_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "43200"))  # 30 days
JWT_ALGO = "HS256"
JWT_LEEWAY = int(os.getenv("JWT_CLOCK_LEEWAY", "10"))

# --- Supabase (optional, keep your Option B) ---
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")

# --- short-lived reset token config (NEW) ---
JWT_RESET_SECRET = os.getenv("JWT_RESET_SECRET", JWT_SECRET)
JWT_RESET_EXPIRE_MINUTES = int(os.getenv("JWT_RESET_EXPIRE_MINUTES", "60"))

# where the email link should send users (your frontend reset page)
RESET_BASE_URL = os.getenv("RESET_BASE_URL", "https://gospelai.vercel.app/reset")

# demo store (replace with DB in prod)
USERS: dict[str, str] = {}  # { email: bcrypt_hash }

# -------- models --------
class RegisterInput(BaseModel):
    email: EmailStr
    password: str

class LoginInput(BaseModel):
    email: EmailStr
    password: str

class ForgotInput(BaseModel):      # NEW
    email: EmailStr

class ResetInput(BaseModel):       # NEW
    token: str
    new_password: str

# -------- helpers --------
def create_token(email: str) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": email,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=JWT_EXPIRE_MINUTES)).timestamp()),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)

def create_reset_token(email: str) -> str:   # NEW
    now = datetime.now(timezone.utc)
    payload = {
        "sub": email,
        "typ": "pwreset",
        "jti": secrets.token_urlsafe(8),
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=JWT_RESET_EXPIRE_MINUTES)).timestamp()),
    }
    return jwt.encode(payload, JWT_RESET_SECRET, algorithm=JWT_ALGO)

def _decode(token: str, secret: str) -> dict:
    return jwt.decode(
        token,
        secret,
        algorithms=[JWT_ALGO],
        options={"verify_aud": False},
        leeway=JWT_LEEWAY,
    )

def _extract_identity(claims: dict) -> Optional[str]:
    return claims.get("email") or claims.get("sub")

# -------- routes: register/login --------
@router.post("/register")
def register(data: RegisterInput):
    if data.email in USERS:
        raise HTTPException(status_code=400, detail="User already exists")
    USERS[data.email] = pwd_context.hash(data.password)
    return {"token": create_token(data.email)}

@router.post("/login")
def login(data: LoginInput):
    hashed = USERS.get(data.email)
    if not hashed or not pwd_context.verify(data.password, hashed):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"token": create_token(data.email)}

# -------- routes: forgot/reset (NEW) --------
@router.post("/forgot")
def forgot(data: ForgotInput):
    # Always 200 to avoid revealing account existence
    if data.email in USERS:
        token = create_reset_token(data.email)
        reset_url = f"{RESET_BASE_URL}?token={token}"
        # In dev, print (and optionally return) the link
        if os.getenv("ENV", "dev") != "prod":
            print(f"[DEV] Reset link for {data.email}: {reset_url}")
            return {"ok": True, "message": "If this email exists, a reset link was sent.", "reset_url": reset_url}
    return {"ok": True, "message": "If this email exists, a reset link was sent."}

@router.post("/reset")
def reset(data: ResetInput):
    try:
        claims = jwt.decode(data.token, JWT_RESET_SECRET, algorithms=[JWT_ALGO])
        if claims.get("typ") != "pwreset":
            raise Exception("Invalid token type")
        email = claims["sub"]
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid or expired token")

    if email not in USERS:
        return {"ok": True}  # do not leak account existence

    if len(data.new_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")

    USERS[email] = pwd_context.hash(data.new_password)
    return {"ok": True, "message": "Password updated"}

# -------- public helper for your other routes --------
def require_user(token: Optional[str]) -> str:
    if not token:
        raise HTTPException(status_code=401, detail="Missing token")

    # 1) try backend JWT
    try:
        claims = _decode(token, JWT_SECRET)
        ident = _extract_identity(claims)
        if ident:
            return ident
    except Exception:
        pass

    # 2) try Supabase access token
    if SUPABASE_JWT_SECRET:
        try:
            claims = _decode(token, SUPABASE_JWT_SECRET)
            ident = _extract_identity(claims)
            if ident:
                return ident
            raise HTTPException(status_code=401, detail="Invalid token (no subject/email)")
        except Exception as e:
            raise HTTPException(status_code=401, detail=f"Invalid token: {e}")

    raise HTTPException(status_code=401, detail="Invalid token")
