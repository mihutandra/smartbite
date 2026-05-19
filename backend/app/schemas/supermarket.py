from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


class SupermarketBase(BaseModel):
    name: str
    address: str
    latitude: float
    longitude: float
    phone_number: str | None = None
    email: str | None = None
    website: str | None = None
    logo_url: str | None = None
    opening_hours: dict | None = None
    rating: float | None = Field(default=None, ge=0, le=5)


class SupermarketOut(SupermarketBase):
    id: UUID
    is_active: bool = True
    rating: float | None = None
    created_at: datetime
    updated_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


class SupermarketDetails(SupermarketBase):
    name: str
    address: str
    latitude: float
    longitude: float
    phone_number: str | None = None
    email: str | None = None
    website: str | None = None
    logo_url: str | None = None
    opening_hours: dict | None = None
    rating: float | None = Field(default=None, ge=0, le=5)