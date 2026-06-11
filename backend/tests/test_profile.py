from uuid import uuid4

from sqlalchemy import select

from app.core.security import hash_password, verify_password
from app.models.user import User


def _create_user(db_session, *, email: str | None = None, password: str = "password123") -> User:
    suffix = uuid4().hex
    user = User(
        name="Profile Tester",
        email=email or f"profile.{suffix}@example.com",
        password_hash=hash_password(password),
        phone="0700000000",
        location="Bucharest",
        latitude=44.4268,
        longitude=26.1025,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


def _auth_headers(test_client, email: str, password: str) -> dict[str, str]:
    login_response = test_client.post(
        "/api/auth/login",
        json={"email": email, "password": password},
    )
    assert login_response.status_code == 200
    token = login_response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_get_profile_returns_authenticated_user(test_client, db_session):
    user = _create_user(db_session)
    headers = _auth_headers(test_client, user.email, "password123")

    response = test_client.get("/api/profile", headers=headers)

    assert response.status_code == 200
    body = response.json()
    assert body["id"] == str(user.id)
    assert body["email"] == user.email
    assert body["name"] == "Profile Tester"


def test_update_profile_changes_account_settings(test_client, db_session):
    user = _create_user(db_session)
    headers = _auth_headers(test_client, user.email, "password123")
    new_email = f"updated.{uuid4().hex}@example.com"

    response = test_client.patch(
        "/api/profile",
        json={
            "name": "Updated Name",
            "email": new_email,
            "phone": "0711111111",
            "location": "Cluj-Napoca",
            "latitude": 46.7712,
            "longitude": 23.6236,
        },
        headers=headers,
    )

    assert response.status_code == 200
    body = response.json()
    assert body["name"] == "Updated Name"
    assert body["email"] == new_email
    assert body["phone"] == "0711111111"
    assert body["location"] == "Cluj-Napoca"
    assert body["latitude"] == 46.7712
    assert body["longitude"] == 23.6236

    updated_user = db_session.scalars(select(User).where(User.id == user.id)).one()
    assert updated_user.email == new_email
    assert updated_user.name == "Updated Name"


def test_update_profile_rejects_duplicate_email(test_client, db_session):
    user = _create_user(db_session)
    existing_user = _create_user(db_session)
    headers = _auth_headers(test_client, user.email, "password123")

    response = test_client.patch(
        "/api/profile",
        json={"email": existing_user.email},
        headers=headers,
    )

    assert response.status_code == 409
    assert response.json()["detail"] == "Email already registered"


def test_update_profile_can_clear_optional_settings(test_client, db_session):
    user = _create_user(db_session)
    headers = _auth_headers(test_client, user.email, "password123")

    response = test_client.patch(
        "/api/profile",
        json={"phone": None, "location": None, "latitude": None, "longitude": None},
        headers=headers,
    )

    assert response.status_code == 200
    body = response.json()
    assert body["phone"] is None
    assert body["location"] is None
    assert body["latitude"] is None
    assert body["longitude"] is None


def test_change_password_requires_current_password(test_client, db_session):
    user = _create_user(db_session)
    headers = _auth_headers(test_client, user.email, "password123")

    response = test_client.put(
        "/api/profile/password",
        json={"current_password": "wrong-password", "new_password": "new-password123"},
        headers=headers,
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Current password is incorrect"


def test_change_password_updates_login_credentials(test_client, db_session):
    user = _create_user(db_session)
    headers = _auth_headers(test_client, user.email, "password123")

    response = test_client.put(
        "/api/profile/password",
        json={"current_password": "password123", "new_password": "new-password123"},
        headers=headers,
    )

    assert response.status_code == 200
    assert response.json()["message"] == "Password changed successfully"

    profile_response = test_client.get("/api/profile", headers=headers)
    assert profile_response.status_code == 401
    assert profile_response.json()["detail"] == "Token revoked"

    db_session.refresh(user)
    assert verify_password("new-password123", user.password_hash) is True

    old_login_response = test_client.post(
        "/api/auth/login",
        json={"email": user.email, "password": "password123"},
    )
    assert old_login_response.status_code == 401

    new_login_response = test_client.post(
        "/api/auth/login",
        json={"email": user.email, "password": "new-password123"},
    )
    assert new_login_response.status_code == 200
