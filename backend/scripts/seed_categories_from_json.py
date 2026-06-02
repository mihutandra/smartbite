"""
Seed/update categories from backend/seed/categories_seed.json.

Run from repo root:
  python3 backend/scripts/seed_categories_from_json.py

Or via Docker:
  docker compose run --rm main python scripts/seed_categories_from_json.py
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

INPUT_CANDIDATES = [
    BACKEND_DIR / "seed" / "categories_seed.json",
    BACKEND_DIR / "categories_seed.json",
]


def seed_categories_from_json() -> None:
    input_file = next((path for path in INPUT_CANDIDATES if path.exists()), None)
    if input_file is None:
        candidates_str = ", ".join(str(path) for path in INPUT_CANDIDATES)
        raise FileNotFoundError(f"Input file not found. Tried: {candidates_str}")

    with open(input_file, "r", encoding="utf-8") as f:
        categories_data = json.load(f)
    if not isinstance(categories_data, list):
        raise ValueError("Seed file must contain a JSON array of category objects.")

    session = SessionLocal()
    try:
        existing_categories = session.query(Category).all()
        existing_by_name = {category.name: category for category in existing_categories}

        added_count = 0
        updated_count = 0

        for item in categories_data:
            if not isinstance(item, dict):
                print(f"Skipping invalid item (expected object): {item!r}")
                continue

            name = item["name"]
            description = item.get("description")
            is_active = item.get("is_active", True)

            existing_category = existing_by_name.get(name)
            if existing_category:
                existing_category.description = description
                existing_category.is_active = is_active
                updated_count += 1
            else:
                session.add(
                    Category(
                        name=name,
                        description=description,
                        is_active=is_active,
                    )
                )
                added_count += 1

        session.commit()
        print("✓ Category seed/update finished successfully!")
        print(f"  - {updated_count} category(ies) updated")
        print(f"  - {added_count} category(ies) added")
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


if __name__ == "__main__":
    seed_categories_from_json()
