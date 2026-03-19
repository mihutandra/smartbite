#!/usr/bin/env sh

# First, run DB migrations
alembic upgrade head

python scripts/seed_supermarkets.py
python scripts/seed_products.py


# Then, start Uvicorn
# Optionally, pass --reload for dev hot-reload
uvicorn app.main:app --host 0.0.0.0 --port 8000 $@
