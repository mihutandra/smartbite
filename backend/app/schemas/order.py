from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel

from app.models.enums import OrderStatus


class OrderItemOut(BaseModel):
    id: UUID
    supermarket_product_id: UUID
    quantity: int
    unit_price: Decimal
    line_total: Decimal

    product_id: UUID | None = None
    product_name: str | None = None
    product_image_url: str | None = None

    supermarket_id: UUID | None = None
    supermarket_name: str | None = None


class OrderOut(BaseModel):
    id: UUID
    status: OrderStatus
    total_amount: Decimal
    currency: str
    placed_at: datetime
    completed_at: datetime | None = None
    items: list[OrderItemOut]


class UserOrdersOut(BaseModel):
    active: list[OrderOut]
    done: list[OrderOut]
