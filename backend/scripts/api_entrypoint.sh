#!/usr/bin/env sh

# Wait for database to be ready (assuming Postgres is on host 'db' and port 5432)
echo "Waiting for postgres connection..."
while ! nc -z db 5432; do
  sleep 0.1
done
echo "PostgreSQL started"

# Now run migrations safely
alembic upgrade head

echo "Seeding supermarkets..."
python scripts/seed_supermarkets.py

echo "Seeding products..."
python scripts/seed_products.py

echo "Seeding supermarket products..."
python scripts/seed_supermarket_products.py

echo "Seeding users..."
python scripts/seed_users.py

exec uvicorn app.main:app --host 0.0.0.0 --port 8000 "$@"
