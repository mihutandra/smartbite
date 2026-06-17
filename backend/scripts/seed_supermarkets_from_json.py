"""
Seed/update supermarkets from backend/seed/supermarkets_seed.json.

Run from repo root:
  python3 backend/scripts/seed_supermarkets_from_json.py

Or via Docker:
  docker compose run --rm main python scripts/seed_supermarkets_from_json.py
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.core.database import SessionLocal
from app.models.supermarket import Supermarket

INPUT_CANDIDATES = [
    BACKEND_DIR / "seed" / "supermarkets_seed.json",
    BACKEND_DIR / "supermarkets_seed.json",
]


def seed_supermarkets_from_json() -> None:
    input_file = next((path for path in INPUT_CANDIDATES if path.exists()), None)
    if input_file is None:
        candidates_str = ", ".join(str(path) for path in INPUT_CANDIDATES)
        raise FileNotFoundError(f"Input file not found. Tried: {candidates_str}")

    with open(input_file, "r", encoding="utf-8") as f:
        supermarkets_data = json.load(f)
    if not isinstance(supermarkets_data, list):
        raise ValueError("Seed file must contain a JSON array of supermarket objects.")

    session = SessionLocal()
    try:
        existing_supermarkets = session.query(Supermarket).all()
        existing_by_name = {supermarket.name: supermarket for supermarket in existing_supermarkets}

        added_count = 0
        updated_count = 0

        for item in supermarkets_data:
            if not isinstance(item, dict):
                print(f"Skipping invalid item (expected object): {item!r}")
                continue

            name = item["name"]
            fields = dict(
                address=item["address"],
                latitude=item["latitude"],
                longitude=item["longitude"],
                phone_number=item.get("phone_number"),
                email=item.get("email"),
                website=item.get("website"),
                logo_url=item.get("logo_url"),
                opening_hours=item.get("opening_hours"),
                rating=item.get("rating"),
                is_active=item.get("is_active", True),
            )

            existing_supermarket = existing_by_name.get(name)
            if existing_supermarket:
                for field_name, value in fields.items():
                    setattr(existing_supermarket, field_name, value)
                updated_count += 1
            else:
                session.add(Supermarket(name=name, **fields))
                added_count += 1

        session.commit()
        print("✓ Supermarket seed/update finished successfully!")
        print(f"  - {updated_count} supermarket(s) updated")
        print(f"  - {added_count} supermarket(s) added")
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


if __name__ == "__main__":
    seed_supermarkets_from_json()