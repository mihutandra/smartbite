#!/usr/bin/env sh

# First, run DB migrations
alembic -c /base/alembic.ini upgrade head

# Then, run Pytest with any other args provided
pytest "$@"
