from datetime import date
from decimal import Decimal
from uuid import UUID
from pydantic import BaseModel, ConfigDict


class SupermarketProductBase(BaseModel):
    supermarket_id: UUID
    product_id: UUID
    original_price: Decimal
    discount_price: Decimal
    currency: str = "RON"
    expiration_date: date
    stock_quantity: int = 0
    store_product_code: str | None = None
    is_available: bool = True


class SupermarketProductOut(SupermarketProductBase):
    id: UUID

    model_config = ConfigDict(from_attributes=True)
