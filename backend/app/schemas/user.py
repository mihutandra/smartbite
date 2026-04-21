from __future__ import annotations

import uuid
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field

from app.models.enums import UserRole


# ── Request schemas ──────────────────────────────────────────────────────────

class UserRegisterRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    phone: str = Field(..., min_length=5, max_length=50)
    location: str | None = Field(default=None, max_length=255)
    latitude: float | None = None
    longitude: float | None = None


class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    phone: str | None = Field(default=None, max_length=50)
    location: str | None = Field(default=None, max_length=255)
    latitude: float | None = None
    longitude: float | None = None


# ── Response schemas ─────────────────────────────────────────────────────────

class UserOut(BaseModel):
    id: uuid.UUID
    name: str
    email: str
    role: UserRole
    phone: str | None
    location: str | None
    latitude: float | None
    longitude: float | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"