from sqlalchemy.orm import Session

from app.repositories.user_repository import (
    get_user_by_email,
    get_user_by_id,
    create_user,
)
from app.auth.password_utils import hash_password, verify_password
from app.auth.jwt_utils import create_jwt_token
from app.exceptions.exceptions import Unauthorized, DomainError
from app.models.enums import UserType


def register_user(db: Session, payload):
    existing = get_user_by_email(db, payload.email)
    if existing:
        raise DomainError(
            message="Email already registered",
            code="already_exists",
            entity="User",
            identifier=payload.email,
        )

    user = create_user(
        db=db,
        email=payload.email,
        name=payload.name,
        password_hash=hash_password(payload.password),
        user_type=UserType.USER,
    )

    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "user_type": user.user_type,
        "created_at": user.created_at,
        "updated_at": user.updated_at,
    }


def login_user(db: Session, payload):
    user = get_user_by_email(db, payload.email)
    if not user or not verify_password(payload.password, user.password_hash):
        raise Unauthorized(message="Invalid email or password")

    token = create_jwt_token(
        user_id=str(user.id),
        role=user.user_type,
    )

    return {
        "access_token": token,
        "token_type": "bearer",
    }


def get_current_user(db: Session, user_id: int):
    user = get_user_by_id(db, user_id)
    if not user:
        raise Unauthorized(message="User not found")
    return user