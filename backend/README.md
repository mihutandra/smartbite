## Description

This project is a backend service for a mobile app for ordering groceries.

The focus of the project is **clean architecture**, **domain modeling**, and **maintainable backend design**, following a layered approach:
**API → Services → Repositories → Database**.

## Scope

---

## Tech Stack

### Backend

- **Python 3.12**
- **FastAPI** – REST API framework
- **Uvicorn** – ASGI server

### Database

- **PostgreSQL**
- **SQLAlchemy (ORM)**
- **Alembic** – database migrations

### Infrastructure

- **Docker**
- **Docker Compose**

### Tooling

- **GitHub** – source control
- **pgAdmin** – database inspection & manual data seeding

---

## Architecture Overview

The project follows a layered architecture:

### API (routers)

### ↓

### Services (business logic)

### ↓

### Repository (data access)

### ↓

### PostgreSQL / SQLAlchemy (database)

- Business logic lives in **services**
- Database access lives in **repositories**
- Controllers (routers) are thin
- Validation happens at:
  - API level (Pydantic)
  - Database level (constraints)

---

---

## API Endpoints

### EXAMPLE - for now

| Method | Endpoint                           | Description                                |
| ------ | ---------------------------------- | ------------------------------------------ |
| POST   | `/api/brokers/clients`             | Create a new client                        |
| PATCH  | `/api/brokers/clients/{client_id}` | Update client details (name, contact info) |
| GET    | `/api/brokers/clients/{client_id}` | Get client details                         |
| GET    | `/api/brokers/clients?search=`     | Search clients by name (partial match)     |

> Note: Client identification number (CNP/CUI) cannot be changed via standard update.

## Validation Rules

### Example: Client

- CNP (individual): **exactly 13 digits**
- CUI (company): **2–10 digits**
- Identification number is unique and digits-only

All rules are enforced at:

- API level (Pydantic)
- Database level (constraints)

---

## Installation & Running

To run the project, follow these steps:

1. For easy, platform-independend deployment, this project uses Docker. Make sure you have Docker installed and the Docker engine running.
2. Clone the repository locally:

```powershell
git clone https://github.com/mihutandra/smartbite
```

3. Create a `.env` file for configuration variables (you can use `.env.example` as guideline) in the project root
4. (Optionally) If intending to run a development-branch version, switch to the appropriate branch:

```powershell
git switch <target_branch>
```

5. Launch Docker Compose, stop with Ctrl+C when done:  
   (Optionally: launch with `-d` detached flag to not block terminal.)

```powershell
docker compose up
```

6. (Once done, if `-d`) Put down Docker stack:

```powershell
docker compose down
```

---

````
### Alembic Migrations

If you change or extend the current model, you should autogenerate a migration through Alembic:
1. Make any desired changes to the code (e.g. change a model class, or add a new one)
2. Run the Alembic Docker service:
```powershell
docker compose -f backend/compose.yaml --profile alembic run --rm alembic revision --autogenerate -m "add something"
````

3. Wait until migration is done, then shut down DB service also:

```powershell
docker compose down
```

4. (Recommended) Rebuild the containers, since Alembic migrations are not hot-reloaded like the code changes.

```powershell
docker compose build
```

Note that for the above to work, your database must be up-to-date with the existing migrations.  
If not, first run:

```powershell
docker compose run --rm alembic upgrade head
```

Note that iff you've made some Alembic migrations that you now want to walk back, you can use `downgrade`. For instance to reverse one migration, run:

```powershell
docker compose run --rm alembic downgrade -1
```

(Or, for the nuclear option – be warned, this deletes all DB data –, just remove the volume with `docker compose down -v` and upgrade back to where you want to be.)

### Managing Dependencies

Dependencies are currently specified in human-readable format in [requirements.in](./requirements.in) (main app) and [requirements.test.in](requirements.test.in) (testing-specific), then compiled using `pip-tools` into a clearly-versioned [requirements.txt](./requirements.txt) and [requirements.test.txt](requirements.test.txt).

1. Make changes to `requirements.in` and/or `requirements.test.in` as needed.
2. If `requirements.in` changed, update base app deps:

```powershell
docker compose run --rm --volume ./:/base/ --no-deps --entrypoint sh main -c "pip install pip-tools && pip-compile --generate-hashes --output-file requirements.txt requirements.in"
```

3. If so, rebuild the main Docker stack to fetch deps:

```powershell
docker compose build
```

4. If either of `requirements.in` and `requirements.test.in` changed, update testing deps:

```powershell
docker compose -f compose.test.yaml run --rm --volume ./:/base/ --no-deps --entrypoint sh test -c "pip install pip-tools && pip-compile --generate-hashes --output-file requirements.test.txt requirements.in requirements.test.in"
```

5. If so, rebuild the testing Docker stack to fetch testing deps:

```powershell
docker compose -f compose.test.yaml build
```

6. Verify functionality, run tests, ensure everything works correctly, and you're good to go.

Note: in the current implementation, second-hand dependencies may be upgraded when you run `pip-compile`. I am not yet entirely certain how to pin those down while also allowing manual version upgrades for dependencies in `requirements.in`.

### Running Tests

To run tests, launch the Docker Compose setup for testing. Tests are marked, therefore it's possible to run only specific tests. Current test markers are:

- integration: integration tests
- unit: unit tests
- slow: slow-running tests (skip with `"not slow"`)
- db: tests that use the DB

For command-line arguments (useful if you want to pass test filters, e.g. `-m "not slow"`)

```powershell
docker compose -f compose.test.yaml run --rm test [Pytest command line args, if any like --disable-warnings]
```

...wait until tests finish, then put down the stack:

```powershell
docker compose -f compose.test.yaml down
```

For smoother running:

```powershell
docker compose -f compose.test.yaml up --abort-on-container-exit --exit-code-from test
```

## Development

This chapter contains guidelines for modifying / extending the application. If you only wish to run it as-is, you can ignore it.

### Project Structure

```
smartbite/
├── alembic/
│   ├── versions/                             # Auto-generated migrations
│   ├── env.py                                # Alembic migration environment
│   └── script.py.mako                        # Template for new migrations
│
├── app/
│   ├── core/
│   │   ├── config.py                          # loads .env
│   │   └── database.py                        # SQLAlchemy engine, Base, SessionLocal
|   |
│   ├── auth/
│   │   ├── jwt_utils.py                       # creates and verifies token
│   │   └── password_utils.py                  # hashed and verifies password
│   │
│   ├── exceptions/
│   │   └── exceptions.py                      # All custom exceptions
│   │
│   ├── factories/
│   │   ├── example.py                          # Dependency injection constructors for service + repository
│   │
│   ├── models/
│   │   ├── example.py                   # Administrator SQLAlchemy model
│   │
│   ├── schemas/
│   │   ├── example.py                   # Administrator Pydantic schema
│   │
│   ├── repositories/
│   │   ├── example.py               # BrokerRepository: SQLALchemy data access
│   │
│   ├── services/
│   │   ├── example.py                  # Business logic
│   │
│   ├── routers/
│   │   ├── example.py                     # API endpoint for ... module
│   │
│   └── main.py                                # Application entrypoint (FastAPI instance, router registration)
│
├── tests/                                     # Test folder
│   │   └── auth                               # Authentication tests
│   │   └── integration                        # Integration tests
│   │   └── repositories                       # Unit tests for all repositories
│   │   └── services                           # Unit tests for all services
│   │   └── routers                            # Unit tests for all routers
|
├── compose.yaml                               # Container setup (FastAPI, PostgreSQL, Alembic)
├── compose.test.yaml                          # Container test setup (FastAPI, PostgreSQL, Alembic)
├── Dockerfile                                 # Builds FastAPI app image
│
├── requirements.test.in                       # Editable dependency list
├── requirements.test.txt                      # Compiled dependencies (pip-compile with hashes)
|
├── requirements.in                            # Editable dependency list
├── requirements.txt                           # Compiled dependencies (pip-compile with hashes)
│
├── .env                                       # Environment variables
├── .gitignore                                 # Ignored files (venv, storage, migrations, cache)
│
└── README.md                                  # Project documentation
```

## Contributing

I am open to contributions :)
When adding features:

1. Ensure tests are added (unit + integration)
2. Maintain 80%+ code coverage
3. Follow the layered architecture pattern
4. Add validation at both API and service levels
5. Update this README if needed
