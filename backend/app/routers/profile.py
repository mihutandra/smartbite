from uuid import UUID

from fastapi import APIRouter, Depends

from app.auth.jwt_utils import verify_jwt
from app.factories.reservation import get_reservation_service
from app.schemas.user import ProfileSavingsOut
from app.services.reservation import ReservationService


router = APIRouter(prefix="/api/profile", tags=["Profile"])


@router.get("/savings", response_model=ProfileSavingsOut)
def get_my_profile_savings(
    current_user: dict = Depends(verify_jwt),
    service: ReservationService = Depends(get_reservation_service),
):
    user_id = UUID(current_user["user_id"])
    return service.get_user_total_savings(user_id=user_id)
