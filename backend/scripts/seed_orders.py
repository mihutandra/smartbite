"""
Seed script to populate sample orders.
Run this from the backend directory with: python scripts/seed_orders.py
Or via Docker: docker compose run --rm main python scripts/seed_orders.py
"""
import sys
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from pathlib import Path

sys.path.insert(0, "/base")
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.core.database import SessionLocal
from app.models.enums import OrderStatus, UserRole
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.supermarket_products import SupermarketProduct
from app.models.user import User


def seed_data():
    """Populate active and done sample orders for seeded users."""
    session = SessionLocal()

    try:
        existing_orders = session.query(Order).count()
        if existing_orders > 0:
            print(f"✓ Database already contains {existing_orders} order(s). Skipping seed.")
            return

        users = (
            session.query(User)
            .filter(User.role == UserRole.USER)
            .filter(User.is_deleted.is_(False))
            .order_by(User.email)
            .limit(3)
            .all()
        )
        supermarket_products = (
            session.query(SupermarketProduct)
            .filter(SupermarketProduct.is_available.is_(True))
            .order_by(SupermarketProduct.expiration_date)
            .limit(12)
            .all()
        )

        if not users:
            raise ValueError("No USER accounts found. Run scripts/seed_users.py first.")
        if len(supermarket_products) < 4:
            raise ValueError("Not enough supermarket products found. Run scripts/seed_supermarket_products.py first.")

        created = 0
        now = datetime.now(timezone.utc)

        for user_index, user in enumerate(users):
            active_products = supermarket_products[user_index * 2 : user_index * 2 + 2]
            done_products = supermarket_products[user_index * 2 + 2 : user_index * 2 + 4]

            active_order = _build_order(
                user=user,
                products=active_products,
                status=OrderStatus.ACTIVE,
                placed_at=now - timedelta(hours=user_index + 1),
            )
            done_order = _build_order(
                user=user,
                products=done_products,
                status=OrderStatus.DONE,
                placed_at=now - timedelta(days=user_index + 2),
                completed_at=now - timedelta(days=user_index + 1),
            )

            session.add(active_order)
            session.add(done_order)
            created += 2

        session.flush()
        session.commit()

        print("✓ Data seeded successfully!")
        print(f"  - {created} orders added")
        print(f"  - {created * 2} order items added")

    except Exception as e:
        session.rollback()
        print(f"✗ Error seeding data: {e}")
        raise
    finally:
        session.close()


def _build_order(
    *,
    user: User,
    products: list[SupermarketProduct],
    status: OrderStatus,
    placed_at: datetime,
    completed_at: datetime | None = None,
) -> Order:
    order = Order(
        user=user,
        status=status.value,
        currency="RON",
        placed_at=placed_at,
        completed_at=completed_at,
    )

    total_amount = Decimal("0.00")
    for index, supermarket_product in enumerate(products):
        quantity = index + 1
        unit_price = supermarket_product.discount_price
        total_amount += unit_price * Decimal(quantity)
        order.items.append(
            OrderItem(
                supermarket_product=supermarket_product,
                quantity=quantity,
                unit_price=unit_price,
            )
        )

    order.total_amount = total_amount.quantize(Decimal("0.01"))
    return order


if __name__ == "__main__":
    seed_data()
