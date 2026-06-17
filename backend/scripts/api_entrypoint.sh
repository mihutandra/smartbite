#!/usr/bin/env sh
set -e

echo "Running migrations..."
alembic upgrade head

echo "Seeding users..."
python scripts/seed_users.py

echo "Seeding categories from json..."
python scripts/seed_categories_from_json.py

echo "Seeding products from json..."
python scripts/seed_products_from_json.py

echo "Seeding supermarkets from json..."
python scripts/seed_supermarkets_from_json.py

echo "Seeding supermarket products from json..."
python scripts/seed_supermarket_products_from_json.py

# clear_catalog_data.py is intentionally NOT run here - it's destructive and
# meant to be invoked manually when you actually want to wipe and reseed:
#   docker compose run --rm main python scripts/clear_catalog_data.py --yes

exec uvicorn app.main:app --host 0.0.0.0 --port 8000 "$@"