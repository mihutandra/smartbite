from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models.enums import OrderStatus
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.supermarket_products import SupermarketProduct


class OrderRepository:
    def __init__(self, session: Session):
        self.session = session

    def get_by_user_id(self, user_id: UUID, status: OrderStatus | None = None) -> list[Order]:
        stmt = (
            select(Order)
            .options(
                joinedload(Order.items)
                .joinedload(OrderItem.supermarket_product)
                .joinedload(SupermarketProduct.product),
                joinedload(Order.items)
                .joinedload(OrderItem.supermarket_product)
                .joinedload(SupermarketProduct.supermarket),
            )
            .where(Order.user_id == user_id)
            .order_by(Order.placed_at.desc())
        )
        if status is not None:
            stmt = stmt.where(Order.status == status.value)

        return list(self.session.scalars(stmt).unique().all())
