#!/bin/sh
# Seed data entrypoint
# Run with: docker compose run --rm main sh scripts/seed_entrypoint.sh
python scripts/seed_supermarkets.py
python scripts/seed_products.py
