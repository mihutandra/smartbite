import pytest
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

from app.core.database import get_session, _engine
from app.main import app

@pytest.fixture(scope="function")
def db_session():
    """Create a new database session for a test."""
    # Use same engine that the app uses, but give each test its own connection and transaction
    connection = _engine.connect()
    transaction = connection.begin()
    TestSessionLocal = sessionmaker(bind=connection)
    session = TestSessionLocal()

    yield session

    session.close()
    # Once the test is done, roll back the transaction, to not persist any changes between tests
    # In case exceptions are raised, SQLAlchemy automatically rolls back the transaction
    # and then it won't be active anymore for us to roll it back here.
    if transaction.is_active:
        transaction.rollback()
    connection.close()

@pytest.fixture(scope="function")
def test_client(db_session):
    """Create a FastAPI test client with a dependency override for the DB session."""
    def override_get_session():
        return db_session

    app.dependency_overrides[get_session] = override_get_session
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
    
def assert_domain_error(
    response,
    *,
    expected_status: int = 400,
    expected_code: str | None = None,
    expected_detail_contains: str | None = None,
    expected_entity: object | None = None,
):
    """
    Assert the response follows the DomainError JSON structure returned by the exception handler:
    {
      "detail": "...",
      "code": "validation_error",
      "entity": ...,
      "identifier": ...
    }
    """
    assert response is not None
    assert response.status_code == expected_status, f"unexpected status: {response.status_code} {response.text}"

    body = response.json()
    assert isinstance(body, dict), f"response body not dict: {response.text}"

    if expected_code is not None:
        assert body.get("code") == expected_code, f"expected code={expected_code}, got={body}"

    if expected_detail_contains is not None:
        detail = str(body.get("detail", "")).lower()
        assert expected_detail_contains.lower() in detail, f"expected detail to contain '{expected_detail_contains}', got: {body.get('detail')}"

    if expected_entity is not None:
        # flexible equality check: if expected_entity is a string check substring in the serialized entity
        entity = body.get("entity")
        if isinstance(expected_entity, str):
            assert expected_entity.lower() in str(entity).lower(), f"expected entity to contain {expected_entity}, got {entity}"
        else:
            assert entity == expected_entity, f"expected entity == {expected_entity}, got {entity}"