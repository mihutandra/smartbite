# Python image
FROM python:3.12-slim AS base

# Set working directory
WORKDIR /base

# Install base dependencies
COPY ./requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r ./requirements.txt

# Copy application code
COPY ./app ./app
COPY ./scripts ./scripts

# Copy Alembic files
COPY ./alembic.ini ./alembic.ini
COPY ./alembic ./alembic


### Main stage ###
FROM base AS main

# Copy entrypoint script (make executable)
COPY --chmod=0755 ./scripts/api_entrypoint.sh ./entrypoint.sh

# Set script as entrypoint
ENTRYPOINT ["./entrypoint.sh"]


### Alembic stage ###
FROM base AS alembic

# Set Alembic as entrypoint
ENTRYPOINT ["alembic"]


### Test stage ###
FROM base AS test

# Copy Pytest config
COPY ./pytest.ini ./pytest.ini
COPY ./.coveragerc ./.coveragerc

# Install test dependencies
COPY ./requirements.test.txt ./requirements.test.txt
RUN pip install --no-cache-dir -r ./requirements.test.txt

# Copy test code
COPY ./tests ./tests

# Copy test entrypoint script (make executable)
COPY --chmod=0755 ./scripts/test_entrypoint.sh ./entrypoint.sh

# Set script as entrypoint
ENTRYPOINT ["./entrypoint.sh"]
