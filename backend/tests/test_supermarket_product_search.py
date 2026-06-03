from datetime import date, timedelta
from decimal import Decimal

from app.models.category import Category
from app.models.product import Product
from app.models.supermarket import Supermarket
from app.models.supermarket_products import SupermarketProduct


def seed_search_data(session):
    category = Category(name="Dairy Search", description="Search test category")
    supermarket = Supermarket(
        name="Search Market",
        address="Search Street 1",
        latitude=44.4268,
        longitude=26.1025,
        email="search@test.local",
    )
    product_name_match = Product(
        name="Brânză de vaci",
        description="Produs lactat proaspat",
        category=category,
        brand="Napolact",
    )
    product_description_match = Product(
        name="Foietaj simplu",
        description="Foietaj cu brânză sarata",
        category=category,
        brand="Fornetti",
    )
    product_no_match = Product(
        name="Lapte integral",
        description="Lapte proaspat",
        category=category,
        brand="Zuzu",
    )

    items = [
        SupermarketProduct(
            supermarket=supermarket,
            product=product_name_match,
            original_price=Decimal("12.00"),
            discount_price=Decimal("8.50"),
            currency="RON",
            expiration_date=date.today() + timedelta(days=2),
            stock_quantity=5,
            is_available=True,
        ),
        SupermarketProduct(
            supermarket=supermarket,
            product=product_description_match,
            original_price=Decimal("9.00"),
            discount_price=Decimal("6.00"),
            currency="RON",
            expiration_date=date.today() + timedelta(days=3),
            stock_quantity=4,
            is_available=True,
        ),
        SupermarketProduct(
            supermarket=supermarket,
            product=product_no_match,
            original_price=Decimal("7.00"),
            discount_price=Decimal("5.00"),
            currency="RON",
            expiration_date=date.today() + timedelta(days=4),
            stock_quantity=3,
            is_available=True,
        ),
    ]

    session.add_all([category, supermarket, product_name_match, product_description_match, product_no_match, *items])
    session.commit()


def test_search_matches_diacritics_and_product_description(test_client, db_session):
    seed_search_data(db_session)

    response = test_client.get("/api/supermarket-products/search", params={"item": "branza"})

    assert response.status_code == 200
    product_names = {item["product_name"] for item in response.json()}
    assert product_names == {"Brânză de vaci", "Foietaj simplu"}
