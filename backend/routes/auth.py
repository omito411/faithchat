from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
import os, jwt, secrets

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Existing values
JWT_SECRET = os.getenv("JWT_SECRET", "change_me")
JWT_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "43200"))  # login tokens

# NEW: short-lived reset token
JWT_RESET_SECRET = os.getenv("JWT_RESET_SECRET", JWT_SECRET)
JWT_RESET_EXPIRE_MINUTES = int(os.getenv("JWT_RESET_EXPIRE_MINUTES", "60"))

# Where to send users to finish reset (your frontend)
RESET_BASE_URL = os.getenv("RESET_BASE_URL", "https://gospelai.vercel.app/reset")

# In-memory user store for demo
USERS = {}  # { email: bcrypt_hash }

class RegisterInput(BaseModel):
    email: EmailStr
    password: str

class LoginInput(BaseModel):
    email: EmailStr
    password: str

# NEW
class ForgotInput(BaseModel):
    email: EmailStr

class ResetInput(BaseModel):
    token: str
    new_password: str

def create_token(email: str):
    now = datetime.now(timezone.utc)
    payload = {
        "sub": email,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=JWT_EXPIRE_MINUTES)).timestamp())
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

# NEW: short-lived reset token
def create_reset_token(email: str):
    now = datetime.now(timezone.utc)
    payload = {
        "sub": email,
        "typ": "pwreset",
        "jti": secrets.token_urlsafe(8),  # unique id (handy if you later blacklist)
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=JWT_RESET_EXPIRE_MINUTES)).timestamp()),
    }
    return jwt.encode(payload, JWT_RESET_SECRET, algorithm="HS256")

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

# NEW: request a password reset link
@router.post("/forgot")
def forgot(data: ForgotInput):
    # Always respond 200 to avoid revealing whether the email exists
    exists = data.email in USERS
    if exists:
        token = create_reset_token(data.email)
        reset_url = f"{RESET_BASE_URL}?token={token}"

        # DEV: simulate sending email
        print(f"[DEV] Password reset link for {data.email}: {reset_url}")

        # Optionally return the link in dev to make testing easy
        if os.getenv("ENV", "dev") != "prod":
            return {"ok": True, "message": "If this email exists, a reset link was sent.", "reset_url": reset_url}

    return {"ok": True, "message": "If this email exists, a reset link was sent."}

# NEW: complete the reset with token + new password
@router.post("/reset")
def reset(data: ResetInput):
    try:
        claims = jwt.decode(data.token, JWT_RESET_SECRET, algorithms=["HS256"])
        if claims.get("typ") != "pwreset":
            raise Exception("Invalid token type")
        email = claims["sub"]
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid or expired token")

    if email not in USERS:
        # For uniformity; don't leak existence
        return {"ok": True}

    # Basic password checks (tweak as you like)
    if len(data.new_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")

    USERS[email] = pwd_context.hash(data.new_password)
    return {"ok": True, "message": "Password updated"}
