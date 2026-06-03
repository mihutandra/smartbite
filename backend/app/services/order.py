from decimal import Decimal
from uuid import UUID

from app.exceptions.exceptions import NotFound
from app.models.enums import OrderStatus
from app.models.order import Order
from app.models.order_item import OrderItem
from app.repositories.order import OrderRepository
from app.repositories.user_repository import UserRepository
from app.schemas.order import OrderItemOut, OrderOut, UserOrdersOut


class OrderService:
    def __init__(self, order_repo: OrderRepository, user_repo: UserRepository):
        self.order_repo = order_repo
        self.user_repo = user_repo

    def get_user_orders(self, user_id: UUID) -> UserOrdersOut:
        user = self.user_repo.get_by_id(user_id)
        if user is None or user.is_deleted:
            raise NotFound(entity="User", identifier=str(user_id))

        orders = self.order_repo.get_by_user_id(user_id=user_id)
        active = [self._to_order_out(order) for order in orders if order.status == OrderStatus.ACTIVE.value]
        done = [self._to_order_out(order) for order in orders if order.status == OrderStatus.DONE.value]

        return UserOrdersOut(active=active, done=done)

    def get_user_orders_by_status(self, user_id: UUID, status: OrderStatus) -> list[OrderOut]:
        user = self.user_repo.get_by_id(user_id)
        if user is None or user.is_deleted:
            raise NotFound(entity="User", identifier=str(user_id))

        orders = self.order_repo.get_by_user_id(user_id=user_id, status=status)
        return [self._to_order_out(order) for order in orders]

    def _to_order_out(self, order: Order) -> OrderOut:
        return OrderOut(
            id=order.id,
            status=OrderStatus(order.status),
            total_amount=order.total_amount,
            currency=order.currency,
            placed_at=order.placed_at,
            completed_at=order.completed_at,
            items=[self._to_item_out(item) for item in order.items],
        )

    def _to_item_out(self, item: OrderItem) -> OrderItemOut:
        supermarket_product = item.supermarket_product
        product = supermarket_product.product if supermarket_product else None
        supermarket = supermarket_product.supermarket if supermarket_product else None
        line_total = Decimal(item.quantity) * item.unit_price

        return OrderItemOut(
            id=item.id,
            supermarket_product_id=item.supermarket_product_id,
            quantity=item.quantity,
            unit_price=item.unit_price,
            line_total=line_total,
            product_id=supermarket_product.product_id if supermarket_product else None,
            product_name=product.name if product else None,
            product_image_url=product.image_url if product else None,
            supermarket_id=supermarket_product.supermarket_id if supermarket_product else None,
            supermarket_name=supermarket.name if supermarket else None,
        )
