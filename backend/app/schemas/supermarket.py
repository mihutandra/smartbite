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

class SupermarketOut(SupermarketBase):
    id: UUID
    is_active: bool = True
    
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

class SupermarketMapMarker(BaseModel):
    """Lightweight representation for map markers — just enough to render a pin."""
    id: UUID
    name: str
    latitude: float
    longitude: float
    logo_url: str | None = None

    model_config = ConfigDict(from_attributes=True)

class SupermarketWithDistance(SupermarketOut):
    """Supermarket plus distance from a reference point, in kilometers.
    Distance is rounded to 2 decimals (≈10m precision)."""
    distance_km: float

    model_config = ConfigDict(from_attributes=True)