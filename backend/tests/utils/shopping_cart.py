from __future__ import annotations

from datetime import date, timedelta
from decimal import Decimal

from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models.category import Category
from app.models.product import Product
from app.models.supermarket import Supermarket
from app.models.supermarket_products import SupermarketProduct
from app.models.user import User


def seed_shopping_cart_flow_data(session: Session) -> dict[str, object]:
    user = User(
        name="Cart Tester",
        email="cart.tester@example.com",
        password_hash=hash_password("password123"),
        phone="0700000000",
        location="Bucharest",
        latitude=44.4268,
        longitude=26.1025,
    )

    category = Category(name="Dairy", description="Dairy products")

    product_lidl = Product(
        name="Milk Lidl",
        description="Low fat milk",
        category=category,
        brand="LidlBrand",
        image_url="https://example.com/milk-lidl.png",
    )
    product_kaufland = Product(
        name="Milk Kaufland",
        description="Whole milk",
        category=category,
        brand="KauflandBrand",
        image_url="https://example.com/milk-kaufland.png",
    )

    lidl = Supermarket(
        name="Lidl Test",
        address="Lidl Street 1",
        latitude=44.4300,
        longitude=26.1000,
        email="lidl@test.local",
    )
    kaufland = Supermarket(
        name="Kaufland Test",
        address="Kaufland Street 1",
        latitude=44.4400,
        longitude=26.1100,
        email="kaufland@test.local",
    )

    lidl_item = SupermarketProduct(
        supermarket=lidl,
        product=product_lidl,
        original_price=Decimal("10.00"),
        discount_price=Decimal("7.50"),
        currency="RON",
        expiration_date=date.today() + timedelta(days=2),
        stock_quantity=10,
        is_available=True,
    )
    kaufland_item = SupermarketProduct(
        supermarket=kaufland,
        product=product_kaufland,
        original_price=Decimal("12.00"),
        discount_price=Decimal("8.90"),
        currency="RON",
        expiration_date=date.today() + timedelta(days=3),
        stock_quantity=12,
        is_available=True,
    )

    session.add_all([user, category, product_lidl, product_kaufland, lidl, kaufland, lidl_item, kaufland_item])
    session.commit()

    return {
        "email": user.email,
        "password": "password123",
        "lidl_item_id": str(lidl_item.id),
        "kaufland_item_id": str(kaufland_item.id),
        "lidl_supermarket_id": str(lidl.id),
        "kaufland_supermarket_id": str(kaufland.id),
        "lidl_initial_stock": lidl_item.stock_quantity,
        "kaufland_initial_stock": kaufland_item.stock_quantity,
    }
