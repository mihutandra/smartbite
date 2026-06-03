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

    created_at: datetime
    updated_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


class SupermarketDetails(SupermarketBase):
    model_config = ConfigDict(from_attributes=True)


class SupermarketMapMarker(BaseModel):
    """Marker payload for the map: enough info to render a pin AND
    display a preview card without extra requests."""
    id: UUID
    name: str
    address: str
    latitude: float
    longitude: float
    logo_url: str | None = None
    rating: float | None = Field(default=None, ge=0, le=5)
    offers_count: int = 0
    distance_km: float | None = None

    model_config = ConfigDict(from_attributes=True)


class SupermarketWithDistance(SupermarketOut):
    """Supermarket plus distance from a reference point, in kilometers.
    Distance is rounded to 2 decimals (≈10m precision)."""
    distance_km: float