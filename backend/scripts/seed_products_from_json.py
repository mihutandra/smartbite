"""
Seed/update products from backend/products_seed_with_images.json.

Run from repo root:
  python3 backend/scripts/seed_products_from_json.py

Or from backend dir:
  python3 scripts/seed_products_from_json.py
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.core.database import SessionLocal
from app.models.category import Category
from app.models.product import Product

INPUT_CANDIDATES = [
    BACKEND_DIR / "seed" / "products_seed_with_images.json",
    BACKEND_DIR / "products_seed_with_images.json",
]


def seed_from_json() -> None:
    input_file = next((path for path in INPUT_CANDIDATES if path.exists()), None)
    if input_file is None:
        candidates_str = ", ".join(str(path) for path in INPUT_CANDIDATES)
        raise FileNotFoundError(f"Input file not found. Tried: {candidates_str}")

    with open(input_file, "r", encoding="utf-8") as f:
        products_data = json.load(f)

    session = SessionLocal()
    try:
        categories = session.query(Category).all()
        categories_by_name = {cat.name: cat for cat in categories}

        updated_count = 0
        added_count = 0

        for item in products_data:
            category_name = item.get("category")
            if not category_name:
                print(f"Skipping product without category: {item.get('name')}")
                continue

            category = categories_by_name.get(category_name)
            if category is None:
                category = Category(
                    name=category_name,
                    description=f"Categorie auto-creata: {category_name}",
                    is_active=True,
                )
                session.add(category)
                session.flush()
                categories_by_name[category_name] = category

            name = item["name"]
            brand = item.get("brand")

            existing_product = (
                session.query(Product)
                .filter(Product.name == name, Product.brand == brand)
                .first()
            )

            if existing_product:
                existing_product.description = item.get("description")
                existing_product.category_id = category.id
                existing_product.image_url = item.get("image_url")
                existing_product.is_active = item.get("is_active", True)
                updated_count += 1
            else:
                session.add(
                    Product(
                        name=name,
                        description=item.get("description"),
                        category_id=category.id,
                        brand=brand,
                        image_url=item.get("image_url"),
                        is_active=item.get("is_active", True),
                    )
                )
                added_count += 1

        session.commit()
        print("✓ Product seed/update finished successfully!")
        print(f"  - {updated_count} product(s) updated")
        print(f"  - {added_count} product(s) added")

    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


if __name__ == "__main__":
    seed_from_json()
