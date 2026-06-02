from uuid import UUID
from sqlalchemy import delete, select
from sqlalchemy.orm import Session, joinedload

from app.models.reservation import Reservation
from app.models.shopping_cart import ShoppingCart
from app.models.supermarket_products import SupermarketProduct


class ShoppingCartRepository:
    def __init__(self, session: Session):
        self.session = session

    def get_by_user_id(self, user_id: UUID) -> list[ShoppingCart]:
        stmt = (
            select(ShoppingCart)
            .options(
                joinedload(ShoppingCart.supermarket_product).joinedload(SupermarketProduct.product),
                joinedload(ShoppingCart.supermarket_product).joinedload(SupermarketProduct.supermarket),
            )
            .where(ShoppingCart.user_id == user_id)
            .order_by(ShoppingCart.created_at.desc())
        )
        return list(self.session.scalars(stmt).all())

    def get_by_user_and_supermarket_product(
        self,
        user_id: UUID,
        supermarket_product_id: UUID,
    ) -> ShoppingCart | None:
        stmt = select(ShoppingCart).where(
            ShoppingCart.user_id == user_id,
            ShoppingCart.supermarket_product_id == supermarket_product_id,
        )
        return self.session.scalars(stmt).first()

    def get_first_for_user(self, user_id: UUID) -> ShoppingCart | None:
        stmt = (
            select(ShoppingCart)
            .options(joinedload(ShoppingCart.supermarket_product))
            .where(ShoppingCart.user_id == user_id)
            .order_by(ShoppingCart.created_at.desc())
            .limit(1)
        )
        return self.session.scalars(stmt).first()

    def clear_user_cart(self, user_id: UUID) -> None:
        stmt = delete(ShoppingCart).where(ShoppingCart.user_id == user_id)
        self.session.execute(stmt)
        self.session.flush()

    def delete_by_id_for_user(self, cart_item_id: UUID, user_id: UUID) -> bool:
        stmt = delete(ShoppingCart).where(
            ShoppingCart.id == cart_item_id,
            ShoppingCart.user_id == user_id,
        )
        result = self.session.execute(stmt)
        self.session.commit()
        return result.rowcount > 0

    def create_reservation(self, reservation: Reservation) -> Reservation:
        self.session.add(reservation)
        self.session.flush()
        return reservation

    def create(self, cart_item: ShoppingCart) -> ShoppingCart:
        self.session.add(cart_item)
        self.session.commit()
        self.session.refresh(cart_item)
        return cart_item

    def update(self, cart_item: ShoppingCart) -> ShoppingCart:
        self.session.add(cart_item)
        self.session.commit()
        self.session.refresh(cart_item)
        return cart_item

    def replace_cart_and_add_item(self, user_id: UUID, cart_item: ShoppingCart) -> ShoppingCart:
        self.clear_user_cart(user_id=user_id)
        self.session.add(cart_item)
        self.session.commit()
        self.session.refresh(cart_item)
        return cart_item
