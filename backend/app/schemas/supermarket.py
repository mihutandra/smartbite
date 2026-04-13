from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict


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
    is_active: bool = True


class SupermarketOut(SupermarketBase):
    id: UUID
    created_at: datetime
    updated_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)