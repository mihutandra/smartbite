from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_session
from app.schemas.auth import LoginRequest, RegisterRequest
from app.services.auth_service import login_user, register_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register")
def register(payload: RegisterRequest, db: Session = Depends(get_session)):
    return register_user(db, payload)


@router.post("/login")
def login(payload: LoginRequest, db: Session = Depends(get_session)):
    return login_user(db, payload)