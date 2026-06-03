from __future__ import annotations

from datetime import date, datetime, timedelta, timezone
from decimal import Decimal

from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models.category import Category
from app.models.enums import OrderStatus
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.product import Product
from app.models.supermarket import Supermarket
from app.models.supermarket_products import SupermarketProduct
from app.models.user import User


def seed_orders_flow_data(session: Session) -> dict[str, object]:
    user = User(
        name="Orders Tester",
        email="orders.tester@example.com",
        password_hash=hash_password("password123"),
    )
    other_user = User(
        name="Other Orders Tester",
        email="other.orders.tester@example.com",
        password_hash=hash_password("password123"),
    )

    category = Category(name="Bakery", description="Bakery products")
    product = Product(
        name="Bread",
        description="Whole wheat bread",
        category=category,
        brand="BakeCo",
        image_url="https://example.com/bread.png",
    )
    supermarket = Supermarket(
        name="Lidl Orders",
        address="Orders Street 1",
        latitude=44.4300,
        longitude=26.1000,
        email="orders-lidl@test.local",
    )
    supermarket_product = SupermarketProduct(
        supermarket=supermarket,
        product=product,
        original_price=Decimal("8.00"),
        discount_price=Decimal("5.50"),
        currency="RON",
        expiration_date=date.today() + timedelta(days=2),
        stock_quantity=10,
        is_available=True,
    )

    active_order = Order(
        user=user,
        status=OrderStatus.ACTIVE.value,
        total_amount=Decimal("11.00"),
        currency="RON",
    )
    active_order.items.append(
        OrderItem(
            supermarket_product=supermarket_product,
            quantity=2,
            unit_price=Decimal("5.50"),
        )
    )

    done_order = Order(
        user=user,
        status=OrderStatus.DONE.value,
        total_amount=Decimal("5.50"),
        currency="RON",
        completed_at=datetime.now(timezone.utc),
    )
    done_order.items.append(
        OrderItem(
            supermarket_product=supermarket_product,
            quantity=1,
            unit_price=Decimal("5.50"),
        )
    )

    other_order = Order(
        user=other_user,
        status=OrderStatus.ACTIVE.value,
        total_amount=Decimal("5.50"),
        currency="RON",
    )
    other_order.items.append(
        OrderItem(
            supermarket_product=supermarket_product,
            quantity=1,
            unit_price=Decimal("5.50"),
        )
    )

    session.add_all([user, other_user, category, product, supermarket, supermarket_product, active_order, done_order, other_order])
    session.commit()

    return {
        "email": user.email,
        "password": "password123",
        "active_order_id": str(active_order.id),
        "done_order_id": str(done_order.id),
        "other_order_id": str(other_order.id),
        "supermarket_product_id": str(supermarket_product.id),
    }
