from datetime import date, datetime
from decimal import Decimal
from typing import Literal
from uuid import UUID

from pydantic import BaseModel


ReservationStatus = Literal["active", "cancelled", "completed", "expired", "inactive"]


class ReservationItemOut(BaseModel):
    id: UUID
    supermarket_product_id: UUID
    quantity: int
    reserved_price: Decimal
    currency: str

    product_id: UUID | None = None
    product_name: str | None = None
    product_image_url: str | None = None

    supermarket_id: UUID | None = None
    supermarket_name: str | None = None
    expiration_date: date | None = None


class ReservationOut(BaseModel):
    id: UUID
    status: str
    items: list[ReservationItemOut]
    created_at: datetime
    updated_at: datetime
