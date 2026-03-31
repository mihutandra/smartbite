from sqlalchemy.orm import Session
from app.models.user import User
from app.models.enums import UserType


def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()


def get_user_by_id(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()


def create_user(
        db: Session,
        email: str,
        name: str,
        password_hash: str,
        user_type: UserType = UserType.USER,
):
    user = User(
        email=email,
        name=name,
        password_hash=password_hash,
        user_type=user_type,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user