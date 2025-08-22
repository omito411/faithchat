from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
import os, jwt

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
JWT_SECRET = os.getenv("JWT_SECRET", "change_me")
JWT_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "43200")) # 30 days

# In-memory user store for demo. Replace with a database in production.
USERS = {}

class RegisterInput(BaseModel):
    email: EmailStr
    password: str

class LoginInput(BaseModel):
    email: EmailStr
    password: str

def create_token(email: str):
    now = datetime.now(timezone.utc)
    payload = {
        "sub": email,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=JWT_EXPIRE_MINUTES)).timestamp())
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

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

def require_user(token: str | None):
    if not token:
        raise HTTPException(status_code=401, detail="Missing token")
    try:
        claims = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return claims["sub"]
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
