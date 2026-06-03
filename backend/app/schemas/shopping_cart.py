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


class ShoppingCartSavingsOut(BaseModel):
    total_original_price: Decimal
    total_discount_price: Decimal
    total_lei_saved: Decimal
    currency: str = "RON"


class ShoppingCartItemOut(BaseModel):
    id: UUID
    quantity: int
    supermarket_product_id: UUID

    product_id: UUID | None = None
    product_name: str | None = None

    supermarket_id: UUID | None = None
    supermarket_name: str | None = None

    original_price: Decimal | None = None
    discount_price: Decimal | None = None
    savings_per_unit: Decimal | None = None
    savings_total: Decimal | None = None
    currency: str | None = None
    expiration_date: date | None = None
    stock_quantity: int | None = None

    created_at: datetime
    updated_at: datetime
