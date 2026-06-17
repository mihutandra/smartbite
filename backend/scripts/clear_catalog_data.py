"""
Clear all catalog data: supermarket_products, products, supermarkets, and
categories. Also clears reservation_items and shopping_cart rows, since both
have a foreign key into supermarket_products and would otherwise either
block the delete or become orphaned once their target row disappears.

Does NOT touch: users, or the parent `reservations` rows themselves. They're
left in place (with an empty item list) - reservations aren't catalog data,
and wiping user accounts/activity wasn't part of this task. Extend the
TABLES_IN_DELETE_ORDER list below if you want those cleared too.

This is destructive. By default it's a dry run that only prints what would
be deleted; pass --yes to actually delete.

Run from repo root:
  python3 backend/scripts/clear_catalog_data.py            # dry run
  python3 backend/scripts/clear_catalog_data.py --yes      # actually deletes

Or via Docker:
  docker compose run --rm main python scripts/clear_catalog_data.py --yes
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.core.database import SessionLocal
from app.models.category import Category
from app.models.product import Product
from app.models.reservation import ReservationItem
from app.models.shopping_cart import ShoppingCart
from app.models.supermarket import Supermarket
from app.models.supermarket_products import SupermarketProduct

# Order matters: children before parents, to satisfy foreign key constraints.
TABLES_IN_DELETE_ORDER = [
    ("reservation_items", ReservationItem),
    ("shopping_cart", ShoppingCart),
    ("supermarket_products", SupermarketProduct),
    ("products", Product),
    ("supermarkets", Supermarket),
    ("categories", Category),
]


def clear_catalog_data(commit: bool) -> None:
    session = SessionLocal()
    try:
        counts = {
            label: session.query(model).count() for label, model in TABLES_IN_DELETE_ORDER
        }

        print("Rows currently in scope:")
        for label, count in counts.items():
            print(f"  - {label}: {count}")

        if not commit:
            print("\nDry run only - no rows deleted. Pass --yes to actually delete.")
            return

        print("\nDeleting...")
        for label, model in TABLES_IN_DELETE_ORDER:
            deleted = session.query(model).delete(synchronize_session=False)
            print(f"  - {label}: {deleted} row(s) deleted")

        session.commit()
        print("\n✓ Catalog data cleared successfully!")
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--yes",
        action="store_true",
        help="Actually delete the rows. Without this flag, only a dry-run count is shown.",
    )
    args = parser.parse_args()
    clear_catalog_data(commit=args.yes)