from __future__ import annotations

import uuid
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, EmailStr, Field, model_validator

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


class ProfileUpdateRequest(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    email: EmailStr | None = None
    phone: str | None = Field(default=None, max_length=50)
    location: str | None = Field(default=None, max_length=255)
    latitude: float | None = None
    longitude: float | None = None

    @model_validator(mode="after")
    def require_at_least_one_field(self) -> "ProfileUpdateRequest":
        if not self.model_fields_set:
            raise ValueError("At least one profile field must be provided")
        return self


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8, max_length=128)


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


class LogoutOut(BaseModel):
    message: str


class DeleteAccountOut(BaseModel):
    message: str


class ChangePasswordOut(BaseModel):
    message: str


class ProfileSavingsOut(BaseModel):
    total_savings: Decimal
    currency: str = "RON"
