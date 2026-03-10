#!/usr/bin/env sh

# First, run DB migrations
alembic upgrade head

# Then, run Pytest with any other args provided
pytest "$@"