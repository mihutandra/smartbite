from sqlalchemy.orm import Session
from app.repositories.user_repository import get_user_by_email, create_user
from app.auth.password_utils import verify_password, hash_password
from app.auth.jwt_utils import create_jwt_token
from app.exceptions.exceptions import Unauthorized, AlreadyExists


def register_user(db: Session, payload):
    existing = get_user_by_email(db, payload.email)
    if existing:
        raise AlreadyExists(entity="User", identifier=payload.email)

    user = create_user(
        db=db,
        email=payload.email,
        name=payload.name,
        password_hash=hash_password(payload.password),
    )

    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
    }


def login_user(db: Session, payload):
    user = get_user_by_email(db, payload.email)
    if not user or not verify_password(payload.password, user.password_hash):
        raise Unauthorized(message="Invalid email or password")

    token = create_jwt_token(user_id=str(user.id), role=user.role)
    return {
        "access_token": token,
        "token_type": "bearer",
    }