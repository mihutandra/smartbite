"""
Generate backend/seed/supermarket_products_seed.json by assigning a random
subset of products to each supermarket, with pricing/stock/discount data.

This only reads the other seed JSON files (no DB connection needed), so it
can be re-run any time to regenerate the dataset - e.g. to change how many
products land in each supermarket, or after adding new supermarkets/products.

Run from repo root:
  python3 backend/scripts/generate_supermarket_products_seed.py

Design note on expiration dates: they are NOT baked into the JSON as fixed
calendar dates. This app's whole purpose is near-expiry items, so a frozen
date would look stale - or already in the past - the moment a few days go
by. Instead each entry stores `days_until_expiration` (an offset), and
seed_supermarket_products_from_json.py converts that into an actual date
relative to whenever it's run.
"""
from __future__ import annotations

import json
import random
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parents[1]
PRODUCTS_FILE = BACKEND_DIR / "seed" / "products_seed_with_images.json"
SUPERMARKETS_FILE = BACKEND_DIR / "seed" / "supermarkets_seed.json"
OUTPUT_FILE = BACKEND_DIR / "seed" / "supermarket_products_seed.json"

MIN_PRODUCTS_PER_SUPERMARKET = 30
MAX_PRODUCTS_PER_SUPERMARKET = 40

MIN_PRICE = 2.50
MAX_PRICE = 42.00

MIN_STOCK = 3
MAX_STOCK = 60

MIN_DAYS_UNTIL_EXPIRATION = 1
MAX_DAYS_UNTIL_EXPIRATION = 14

SEED = 42  # fixed seed -> reproducible output across re-runs


def load_json(path: Path) -> list[dict]:
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def discount_for_days(days_until_expiration: int) -> float:
    """Bigger markdown the closer a product is to expiring. Modeling this
    instead of using one flat percentage, since steeper discounts near the
    deadline are the actual point of the app."""
    if days_until_expiration <= 2:
        return random.uniform(0.45, 0.60)
    if days_until_expiration <= 5:
        return random.uniform(0.30, 0.45)
    if days_until_expiration <= 9:
        return random.uniform(0.15, 0.30)
    return random.uniform(0.05, 0.15)


def make_store_product_code(supermarket_name: str, product_index: int) -> str:
    prefix = "".join(ch for ch in supermarket_name.upper() if ch.isalpha())[:3] or "SUP"
    return f"{prefix}-{product_index + 1:04d}"


def main() -> None:
    random.seed(SEED)

    products = load_json(PRODUCTS_FILE)
    supermarkets = load_json(SUPERMARKETS_FILE)

    if not products:
        raise ValueError("No products found in products_seed_with_images.json")
    if not supermarkets:
        raise ValueError("No supermarkets found in supermarkets_seed.json")

    entries: list[dict] = []

    for supermarket in supermarkets:
        supermarket_name = supermarket["name"]
        sample_size = min(
            random.randint(MIN_PRODUCTS_PER_SUPERMARKET, MAX_PRODUCTS_PER_SUPERMARKET),
            len(products),
        )
        chosen_products = random.sample(products, sample_size)

        for product_index, product in enumerate(chosen_products):
            days_until_expiration = random.randint(
                MIN_DAYS_UNTIL_EXPIRATION, MAX_DAYS_UNTIL_EXPIRATION
            )
            original_price = round(random.uniform(MIN_PRICE, MAX_PRICE), 2)
            discount_pct = discount_for_days(days_until_expiration)
            discount_price = round(original_price * (1 - discount_pct), 2)
            stock_quantity = random.randint(MIN_STOCK, MAX_STOCK)

            entries.append(
                {
                    "supermarket_name": supermarket_name,
                    "product_name": product["name"],
                    "product_brand": product.get("brand"),
                    "original_price": original_price,
                    "discount_price": discount_price,
                    "currency": "RON",
                    "days_until_expiration": days_until_expiration,
                    "stock_quantity": stock_quantity,
                    "store_product_code": make_store_product_code(
                        supermarket_name, product_index
                    ),
                    "is_available": stock_quantity > 0,
                }
            )

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(entries, f, ensure_ascii=False, indent=2)

    counts_per_supermarket: dict[str, int] = {}
    for entry in entries:
        counts_per_supermarket[entry["supermarket_name"]] = (
            counts_per_supermarket.get(entry["supermarket_name"], 0) + 1
        )

    print(f"✓ Generated {len(entries)} supermarket_product entries -> {OUTPUT_FILE}")
    for name, count in counts_per_supermarket.items():
        print(f"  - {name}: {count} products")


if __name__ == "__main__":
    main()