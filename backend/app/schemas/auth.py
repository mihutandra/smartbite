from datetime import datetime
from pydantic import BaseModel, EmailStr, Field
from app.models.enums import UserType


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    name: str = Field(min_length=2, max_length=100)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    name: str
    user_type: UserType
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}