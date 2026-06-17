"""
Seed/update supermarket_products from backend/seed/supermarket_products_seed.json.

Requires that categories, products, and supermarkets have already been
seeded - this script links existing Product and Supermarket rows together,
it does not create them. Run seed_categories_from_json.py,
seed_products_from_json.py, and seed_supermarkets_from_json.py first.

Each JSON entry stores `days_until_expiration` rather than a fixed calendar
date, so expiration_date is computed relative to whenever this script runs -
not relative to whenever the JSON file itself was generated.

Run from repo root:
  python3 backend/scripts/seed_supermarket_products_from_json.py

Or via Docker:
  docker compose run --rm main python scripts/seed_supermarket_products_from_json.py
"""
from __future__ import annotations

import json
import sys
from datetime import date, timedelta
from decimal import Decimal
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.core.database import SessionLocal
from app.models.product import Product
from app.models.supermarket import Supermarket
from app.models.supermarket_products import SupermarketProduct

INPUT_CANDIDATES = [
    BACKEND_DIR / "seed" / "supermarket_products_seed.json",
    BACKEND_DIR / "supermarket_products_seed.json",
]


def seed_supermarket_products_from_json() -> None:
    input_file = next((path for path in INPUT_CANDIDATES if path.exists()), None)
    if input_file is None:
        candidates_str = ", ".join(str(path) for path in INPUT_CANDIDATES)
        raise FileNotFoundError(f"Input file not found. Tried: {candidates_str}")

    with open(input_file, "r", encoding="utf-8") as f:
        entries = json.load(f)
    if not isinstance(entries, list):
        raise ValueError("Seed file must contain a JSON array of supermarket_product objects.")

    session = SessionLocal()
    try:
        supermarket_names = {entry["supermarket_name"] for entry in entries}
        product_keys = {(entry["product_name"], entry.get("product_brand")) for entry in entries}
        product_names = {name for name, _ in product_keys}

        supermarkets = (
            session.query(Supermarket)
            .filter(Supermarket.name.in_(supermarket_names))
            .all()
        )
        supermarkets_by_name = {s.name: s for s in supermarkets}

        products = session.query(Product).filter(Product.name.in_(product_names)).all()
        products_by_key = {(p.name, p.brand): p for p in products}

        missing_supermarkets = sorted(supermarket_names - supermarkets_by_name.keys())
        missing_products = sorted(
            f"{name} ({brand})"
            for name, brand in product_keys
            if (name, brand) not in products_by_key
        )

        if missing_supermarkets:
            raise ValueError(
                f"Missing supermarkets in DB - run seed_supermarkets_from_json.py first: "
                f"{missing_supermarkets}"
            )
        if missing_products:
            raise ValueError(
                f"Missing products in DB - run seed_products_from_json.py first: "
                f"{missing_products}"
            )

        today = date.today()
        added_count = 0
        updated_count = 0

        for entry in entries:
            supermarket = supermarkets_by_name[entry["supermarket_name"]]
            product = products_by_key[(entry["product_name"], entry.get("product_brand"))]
            expiration_date = today + timedelta(days=int(entry["days_until_expiration"]))

            fields = dict(
                original_price=Decimal(str(entry["original_price"])),
                discount_price=Decimal(str(entry["discount_price"])),
                currency=entry.get("currency", "RON"),
                stock_quantity=entry.get("stock_quantity", 0),
                store_product_code=entry.get("store_product_code"),
                is_available=entry.get("is_available", True),
            )

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
                for field_name, value in fields.items():
                    setattr(existing, field_name, value)
                updated_count += 1
            else:
                session.add(
                    SupermarketProduct(
                        supermarket_id=supermarket.id,
                        product_id=product.id,
                        expiration_date=expiration_date,
                        **fields,
                    )
                )
                added_count += 1

        session.commit()
        print("✓ SupermarketProduct seed/update finished successfully!")
        print(f"  - {updated_count} row(s) updated")
        print(f"  - {added_count} row(s) added")
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


if __name__ == "__main__":
    seed_supermarket_products_from_json()