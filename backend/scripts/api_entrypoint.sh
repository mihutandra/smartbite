#!/usr/bin/env sh
set -e

echo "Running migrations..."
alembic upgrade head

echo "Seeding supermarkets..."
python scripts/seed_supermarkets.py

echo "Seeding products..."
python scripts/seed_products.py

echo "Seeding supermarket products..."
python scripts/seed_supermarket_products.py

echo "Seeding users..."
python scripts/seed_users.py

# new seeds !!!!!!!
echo "Seeding categories from json"
python scripts/seed_categories_from_json.py

echo "Seeding products from json"
python scripts/seed_products_from_json.py

exec uvicorn app.main:app --host 0.0.0.0 --port 8000 "$@"
