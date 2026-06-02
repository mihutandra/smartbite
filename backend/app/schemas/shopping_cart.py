from datetime import date, datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel


class ShoppingCartAddIn(BaseModel):
    supermarket_product_id: UUID
    quantity: int = 1
    confirm_replace: bool = False


class ShoppingCartAddOut(BaseModel):
    message: str
    cart_replaced: bool = False


class ShoppingCartItemOut(BaseModel):
    id: UUID
    quantity: int
    supermarket_product_id: UUID

    product_id: UUID | None = None
    product_name: str | None = None
    product_image_url: str | None = None

    supermarket_id: UUID | None = None
    supermarket_name: str | None = None

    original_price: Decimal | None = None
    discount_price: Decimal | None = None
    currency: str | None = None
    expiration_date: date | None = None
    stock_quantity: int | None = None

    created_at: datetime
    updated_at: datetime


class ShoppingCartConfirmItemIn(BaseModel):
    cart_item_id: UUID
    quantity: int


class ShoppingCartConfirmIn(BaseModel):
    items: list[ShoppingCartConfirmItemIn]


class ReservationItemOut(BaseModel):
    id: UUID
    supermarket_product_id: UUID
    quantity: int
    reserved_price: Decimal
    currency: str


class ReservationOut(BaseModel):
    id: UUID
    status: str
    items: list[ReservationItemOut]
    created_at: datetime
