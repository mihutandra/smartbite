"""
Seed script to populate supermarket_products using existing products and supermarkets.
Run this from the backend directory with: python scripts/seed_supermarket_products.py
Or via Docker: docker compose run --rm main python scripts/seed_supermarket_products.py
"""
import sys
from datetime import date, timedelta
from decimal import Decimal

sys.path.insert(0, "/base")

from app.core.database import SessionLocal
from app.models.product import Product
from app.models.supermarket import Supermarket
from app.models.supermarket_products import SupermarketProduct


PRODUCT_NAMES = [
    "Pâine neagră Vel Pitar",
    "Lapte Zuzu 3.5%",
    "Smântână Napolact 20%",
    "Șuncă Praga Caroli",
    "Cașcaval Hochland",
    "Gem de căpșuni Râureni",
    "Iaurt simplu Activia",
    "Ouă de găină Agricola 10 buc",
    "Ulei de floarea-soarelui Unisol",
    "Mere Golden România",
    "Banane Chiquita",
    "Paste Barilla Spaghetti nr.5",
    "Paste Băneasa Penne",
    "Sos de roșii Mutti Passata",
    "Ketchup Heinz",
    "Piept de pui Agricola",
    "Ceafă de porc Carrefour",
    "Telemea de vacă Delaco",
    "Biscuiți Oreo Original",
    "Biscuiți Picnic cacao",
    "Chipsuri Lay's cu sare",
    "Chipsuri Chio paprika",
]

SUPERMARKET_NAMES = [
    "Carrefour Express",
    "Lidl România",
    "Kaufland Cluj",
    "Penny Market Timișoara",
    "Mega Image Constanța",
]


def seed_data():
    """Populate supermarket_products for known products and supermarkets."""
    session = SessionLocal()

    try:
        products = (
            session.query(Product)
            .filter(Product.name.in_(PRODUCT_NAMES))
            .order_by(Product.name)
            .all()
        )
        supermarkets = (
            session.query(Supermarket)
            .filter(Supermarket.name.in_(SUPERMARKET_NAMES))
            .order_by(Supermarket.name)
            .all()
        )

        products_by_name = {p.name: p for p in products}
        supermarkets_by_name = {s.name: s for s in supermarkets}

        missing_products = [name for name in PRODUCT_NAMES if name not in products_by_name]
        missing_supermarkets = [name for name in SUPERMARKET_NAMES if name not in supermarkets_by_name]

        if missing_products:
            raise ValueError(f"Missing products in DB: {missing_products}")
        if missing_supermarkets:
            raise ValueError(f"Missing supermarkets in DB: {missing_supermarkets}")

        created = 0
        skipped = 0
        today = date.today()

        for s_index, supermarket_name in enumerate(SUPERMARKET_NAMES):
            supermarket = supermarkets_by_name[supermarket_name]

            for p_index, product_name in enumerate(PRODUCT_NAMES):
                product = products_by_name[product_name]

                # Deterministic values, same across runs.
                base_price = (Decimal("4.50") + Decimal(s_index) * Decimal("0.40") + Decimal(p_index) * Decimal("0.35")).quantize(Decimal("0.01"))
                discount_price = (base_price * Decimal("0.85")).quantize(Decimal("0.01"))
                expiration_date = today + timedelta(days=3 + ((s_index + p_index) % 20))
                stock_quantity = 5 + ((s_index * 11 + p_index * 7) % 45)
                store_product_code = f"{supermarket_name[:3].upper()}-{p_index + 1:03d}-{s_index + 1:02d}"

                existing = (
                    session.query(SupermarketProduct)
                    .filter(
                        SupermarketProduct.supermarket_id == supermarket.id,
                        SupermarketProduct.product_id == product.id,
                        SupermarketProduct.expiration_date == expiration_date,
                    )
                    .first()
                )
                if existing:
                    skipped += 1
                    continue

                session.add(
                    SupermarketProduct(
                        supermarket_id=supermarket.id,
                        product_id=product.id,
                        original_price=base_price,
                        discount_price=discount_price,
                        currency="RON",
                        expiration_date=expiration_date,
                        stock_quantity=stock_quantity,
                        store_product_code=store_product_code,
                        is_available=stock_quantity > 0,
                    )
                )
                created += 1

        session.flush()
        session.commit()

        print("✓ Data seeded successfully!")
        print(f"  - {created} supermarket_product rows added")
        print(f"  - {skipped} supermarket_product rows skipped (already existed)")

    except Exception as e:
        session.rollback()
        print(f"✗ Error seeding data: {e}")
        raise
    finally:
        session.close()


if __name__ == "__main__":
    seed_data()
