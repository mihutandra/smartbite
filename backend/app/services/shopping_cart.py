from uuid import UUID

from app.exceptions.exceptions import DomainError, NotFound, ValidationError
from app.models.reservation import Reservation, ReservationItem
from app.models.shopping_cart import ShoppingCart
from app.repositories.supermarket_product import SupermarketProductRepository
from app.repositories.shopping_cart import ShoppingCartRepository
from app.repositories.user_repository import UserRepository
from app.schemas.shopping_cart import (
    ReservationItemOut,
    ReservationOut,
    ShoppingCartAddOut,
    ShoppingCartConfirmIn,
    ShoppingCartItemOut,
)


class ShoppingCartService:
    def __init__(
        self,
        shopping_cart_repo: ShoppingCartRepository,
        user_repo: UserRepository,
        supermarket_product_repo: SupermarketProductRepository,
    ):
        self.shopping_cart_repo = shopping_cart_repo
        self.user_repo = user_repo
        self.supermarket_product_repo = supermarket_product_repo

    def add_item(
        self,
        user_id: UUID,
        supermarket_product_id: UUID,
        quantity: int,
        confirm_replace: bool,
    ) -> ShoppingCartAddOut:
        user = self.user_repo.get_by_id(user_id)
        if user is None or user.is_deleted:
            raise NotFound(entity="User", identifier=str(user_id))

        if quantity < 1:
            raise ValidationError(message="Quantity must be at least 1", field="quantity")

        supermarket_product = self.supermarket_product_repo.get_by_id(supermarket_product_id)
        if supermarket_product is None:
            raise NotFound(entity="SupermarketProduct", identifier=str(supermarket_product_id))

        existing_item_same_product = self.shopping_cart_repo.get_by_user_and_supermarket_product(
            user_id=user_id,
            supermarket_product_id=supermarket_product_id,
        )

        if existing_item_same_product:
            existing_item_same_product.quantity += quantity
            self.shopping_cart_repo.update(existing_item_same_product)
            return ShoppingCartAddOut(message="Item quantity updated in cart.")

        new_item = ShoppingCart(
            user_id=user_id,
            supermarket_product_id=supermarket_product_id,
            quantity=quantity,
        )
        self.shopping_cart_repo.create(new_item)
        return ShoppingCartAddOut(message="Item added to cart.")

    def get_user_cart(self, user_id: UUID) -> list[ShoppingCartItemOut]:
        user = self.user_repo.get_by_id(user_id)
        if user is None or user.is_deleted:
            raise NotFound(entity="User", identifier=str(user_id))

        cart_items = self.shopping_cart_repo.get_by_user_id(user_id)

        output: list[ShoppingCartItemOut] = []
        for item in cart_items:
            supermarket_product = item.supermarket_product
            product = supermarket_product.product if supermarket_product else None
            supermarket = supermarket_product.supermarket if supermarket_product else None

            output.append(
                ShoppingCartItemOut(
                    id=item.id,
                    quantity=item.quantity,
                    supermarket_product_id=item.supermarket_product_id,
                    product_id=supermarket_product.product_id if supermarket_product else None,
                    product_name=product.name if product else None,
                    product_image_url=product.image_url if product else None,
                    supermarket_id=supermarket_product.supermarket_id if supermarket_product else None,
                    supermarket_name=supermarket.name if supermarket else None,
                    original_price=supermarket_product.original_price if supermarket_product else None,
                    discount_price=supermarket_product.discount_price if supermarket_product else None,
                    currency=supermarket_product.currency if supermarket_product else None,
                    expiration_date=supermarket_product.expiration_date if supermarket_product else None,
                    stock_quantity=supermarket_product.stock_quantity if supermarket_product else None,
                    created_at=item.created_at,
                    updated_at=item.updated_at,
                )
            )

        return output

    def remove_item(self, user_id: UUID, cart_item_id: UUID) -> ShoppingCartAddOut:
        user = self.user_repo.get_by_id(user_id)
        if user is None or user.is_deleted:
            raise NotFound(entity="User", identifier=str(user_id))

        deleted = self.shopping_cart_repo.delete_by_id_for_user(
            cart_item_id=cart_item_id,
            user_id=user_id,
        )
        if not deleted:
            raise NotFound(entity="ShoppingCart", identifier=str(cart_item_id))

        return ShoppingCartAddOut(message="Item removed from cart.")

    def confirm_cart(self, user_id: UUID, payload: ShoppingCartConfirmIn) -> ReservationOut:
        user = self.user_repo.get_by_id(user_id)
        if user is None or user.is_deleted:
            raise NotFound(entity="User", identifier=str(user_id))

        cart_items = self.shopping_cart_repo.get_by_user_id(user_id)
        if not cart_items:
            raise ValidationError(message="Shopping cart is empty", field="shopping_cart")

        quantities_by_item_id = {}
        for item in payload.items:
            if item.quantity < 1:
                raise ValidationError(message="Quantity must be at least 1", field="quantity")
            quantities_by_item_id[item.cart_item_id] = item.quantity

        cart_item_ids = {item.id for item in cart_items}
        payload_item_ids = set(quantities_by_item_id)
        if cart_item_ids != payload_item_ids:
            raise DomainError(
                message="Cart changed before confirmation. Refresh the cart and try again.",
                code="invalid_state",
                entity="shopping_cart",
                identifier={
                    "expected_item_ids": [str(item_id) for item_id in cart_item_ids],
                    "received_item_ids": [str(item_id) for item_id in payload_item_ids],
                },
            )

        reservation = Reservation(user_id=user_id, status="active")

        try:
            for cart_item in cart_items:
                supermarket_product = cart_item.supermarket_product
                if supermarket_product is None:
                    raise NotFound(
                        entity="SupermarketProduct",
                        identifier=str(cart_item.supermarket_product_id),
                    )

                quantity = quantities_by_item_id[cart_item.id]
                available_stock = supermarket_product.stock_quantity or 0
                if not supermarket_product.is_available or quantity > available_stock:
                    raise DomainError(
                        message="Requested quantity exceeds available stock.",
                        code="invalid_state",
                        entity="supermarket_product",
                        identifier={
                            "supermarket_product_id": str(supermarket_product.id),
                            "requested_quantity": quantity,
                            "available_stock": available_stock,
                        },
                    )

                supermarket_product.stock_quantity = available_stock - quantity
                if supermarket_product.stock_quantity == 0:
                    supermarket_product.is_available = False

                reservation.items.append(
                    ReservationItem(
                        supermarket_product_id=supermarket_product.id,
                        quantity=quantity,
                        reserved_price=supermarket_product.discount_price,
                        currency=supermarket_product.currency,
                    )
                )

            self.shopping_cart_repo.create_reservation(reservation)
            self.shopping_cart_repo.clear_user_cart(user_id)
            self.shopping_cart_repo.session.commit()
            self.shopping_cart_repo.session.refresh(reservation)
        except Exception:
            self.shopping_cart_repo.session.rollback()
            raise

        return ReservationOut(
            id=reservation.id,
            status=reservation.status,
            created_at=reservation.created_at,
            updated_at=reservation.updated_at,
            items=[
                ReservationItemOut(
                    id=item.id,
                    supermarket_product_id=item.supermarket_product_id,
                    quantity=item.quantity,
                    reserved_price=item.reserved_price,
                    currency=item.currency,
                )
                for item in reservation.items
            ],
        )
