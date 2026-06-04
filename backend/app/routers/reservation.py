from uuid import UUID

from fastapi import APIRouter, Depends, Query

from app.auth.jwt_utils import verify_jwt
from app.factories.reservation import get_reservation_service
from app.schemas.reservation import ReservationOut, ReservationStatus
from app.services.reservation import ReservationService


router = APIRouter(prefix="/api/reservations", tags=["Reservations"])


@router.get("/", response_model=list[ReservationOut])
def get_my_reservations(
    status: ReservationStatus | None = Query(default=None),
    current_user: dict = Depends(verify_jwt),
    service: ReservationService = Depends(get_reservation_service),
):
    user_id = UUID(current_user["user_id"])
    return service.get_user_reservations(user_id=user_id, status=status)


@router.get("/{reservation_id}", response_model=ReservationOut)
def get_my_reservation(
    reservation_id: UUID,
    current_user: dict = Depends(verify_jwt),
    service: ReservationService = Depends(get_reservation_service),
):
    user_id = UUID(current_user["user_id"])
    return service.get_user_reservation(user_id=user_id, reservation_id=reservation_id)
