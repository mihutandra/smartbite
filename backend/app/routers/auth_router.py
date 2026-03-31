from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_session
from app.auth.jwt_utils import verify_jwt
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse, UserResponse
from app.services.auth_service import register_user, login_user, get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserResponse, status_code=201)
def register(payload: RegisterRequest, db: Session = Depends(get_session)):
    return register_user(db, payload)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_session)):
    return login_user(db, payload)


@router.get("/me", response_model=UserResponse)
def me(token_data=Depends(verify_jwt), db: Session = Depends(get_session)):
    return get_current_user(db, int(token_data["user_id"]))