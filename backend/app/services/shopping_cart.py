from uuid import UUID

from app.exceptions.exceptions import DomainError, NotFound, ValidationError
from app.models.shopping_cart import ShoppingCart
from app.repositories.supermarket_product import SupermarketProductRepository
from app.repositories.shopping_cart import ShoppingCartRepository
from app.repositories.user_repository import UserRepository
from app.schemas.shopping_cart import ShoppingCartAddOut, ShoppingCartItemOut


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

        existing_cart_item = self.shopping_cart_repo.get_first_for_user(user_id)
        if existing_cart_item and existing_cart_item.supermarket_product is not None:
            existing_supermarket_id = existing_cart_item.supermarket_product.supermarket_id
            incoming_supermarket_id = supermarket_product.supermarket_id

            if existing_supermarket_id != incoming_supermarket_id and not confirm_replace:
                raise DomainError(
                    message="Your cart contains items from another supermarket. Confirm to replace them.",
                    code="invalid_state",
                    entity="shopping_cart",
                    identifier={
                        "requires_confirmation": True,
                        "current_supermarket_id": str(existing_supermarket_id),
                        "new_supermarket_id": str(incoming_supermarket_id),
                    },
                )

            if existing_supermarket_id != incoming_supermarket_id and confirm_replace:
                new_item = ShoppingCart(
                    user_id=user_id,
                    supermarket_product_id=supermarket_product_id,
                    quantity=quantity,
                )
                self.shopping_cart_repo.replace_cart_and_add_item(user_id=user_id, cart_item=new_item)
                return ShoppingCartAddOut(
                    message="Cart replaced with items from the selected supermarket.",
                    cart_replaced=True,
                )

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
