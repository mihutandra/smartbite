from fastapi import Depends
from sqlalchemy.orm import Session

from app.core.database import get_session
from app.services.auth_service import AuthService


def get_auth_service(session: Session = Depends(get_session)) -> AuthService:
    return AuthService(session)