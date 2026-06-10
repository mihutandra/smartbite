from uuid import UUID

from fastapi import APIRouter, Depends

from app.auth.jwt_utils import verify_jwt
from app.factories.reservation import get_reservation_service
from app.factories.user import get_auth_service
from app.schemas.user import (
    ChangePasswordOut,
    ChangePasswordRequest,
    ProfileSavingsOut,
    ProfileUpdateRequest,
    UserOut,
)
from app.services.auth import AuthService
from app.services.reservation import ReservationService


router = APIRouter(prefix="/api/profile", tags=["Profile"])


@router.get("", response_model=UserOut)
def get_my_profile(
    current_user: dict = Depends(verify_jwt),
    service: AuthService = Depends(get_auth_service),
):
    user_id = UUID(current_user["user_id"])
    return service.get_by_id(id=user_id)


@router.patch("", response_model=UserOut)
def update_my_profile(
    payload: ProfileUpdateRequest,
    current_user: dict = Depends(verify_jwt),
    service: AuthService = Depends(get_auth_service),
):
    user_id = UUID(current_user["user_id"])
    return service.update_profile(id=user_id, profile_data=payload)


@router.put("/password", response_model=ChangePasswordOut)
def change_my_password(
    payload: ChangePasswordRequest,
    current_user: dict = Depends(verify_jwt),
    service: AuthService = Depends(get_auth_service),
):
    user_id = UUID(current_user["user_id"])
    return service.change_password(id=user_id, password_data=payload)


@router.get("/savings", response_model=ProfileSavingsOut)
def get_my_profile_savings(
    current_user: dict = Depends(verify_jwt),
    service: ReservationService = Depends(get_reservation_service),
):
    user_id = UUID(current_user["user_id"])
    return service.get_user_total_savings(user_id=user_id)
