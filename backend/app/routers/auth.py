from fastapi import APIRouter, Depends, status

from app.auth.jwt_utils import oauth2_scheme, verify_jwt
from app.factories.user import get_auth_service
from app.schemas.user import LogoutOut, TokenOut, UserLoginRequest, UserOut, UserRegisterRequest
from app.services.auth import AuthService
import logging

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/auth",
    tags=["Auth"],
)


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(
        payload: UserRegisterRequest,
        service: AuthService = Depends(get_auth_service),
):
    logger.debug(f"POST /api/auth/register email={payload.email}")
    result = service.register(payload)
    logger.info(f"Registered user id={result.id} email={result.email}")
    return result


@router.post("/login", response_model=TokenOut)
def login(
        payload: UserLoginRequest,
        service: AuthService = Depends(get_auth_service),
):
    logger.debug(f"POST /api/auth/login email={payload.email}")
    result = service.login(email=payload.email, password=payload.password)
    logger.info(f"Login successful email={payload.email}")
    return result


@router.get("/me", response_model=UserOut)
def me(
        current_user: dict = Depends(verify_jwt),
        service: AuthService = Depends(get_auth_service),
):
    logger.debug(f"GET /api/auth/me user_id={current_user['user_id']}")
    from uuid import UUID
    result = service.get_by_id(id=UUID(current_user["user_id"]))
    return result


@router.post("/logout", response_model=LogoutOut)
def logout(
        token: str = Depends(oauth2_scheme),
        service: AuthService = Depends(get_auth_service),
):
    logger.debug("POST /api/auth/logout")
    return service.logout(token=token)