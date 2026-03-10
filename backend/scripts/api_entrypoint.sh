#!/usr/bin/env sh

# First, run DB migrations
alembic upgrade head

# Then, start Uvicorn
# Optionally, pass --reload for dev hot-reload
uvicorn app.main:app --host 0.0.0.0 --port 8000 $@