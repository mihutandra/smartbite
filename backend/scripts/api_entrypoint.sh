#!/usr/bin/env sh

# Wait for database to be ready (assuming Postgres is on host 'db' and port 5432)
echo "Waiting for postgres connection..."
while ! nc -z db 5432; do
  sleep 0.1
done
echo "PostgreSQL started"

# Now run migrations safely
alembic upgrade head

#TODO: Decomment
#python scripts/seed_supermarkets.py
#python scripts/seed_products.py

uvicorn app.main:app --host 0.0.0.0 --port 8000 "$@"