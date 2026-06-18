from uuid import UUID

from fastapi import APIRouter, Depends

from app.auth.jwt_utils import require_manager
from app.factories.reservation import get_reservation_service
from app.schemas.reservation import ReservationOut
from app.services.reservation import ReservationService

router = APIRouter(
    prefix="/api/manager/reservations",
    tags=["Manager - Reservations"],
    dependencies=[Depends(require_manager)],
)

@router.post("/{reservation_id}/complete", response_model=ReservationOut)
def complete_reservation(
    reservation_id: UUID,
    service: ReservationService = Depends(get_reservation_service),
):
    return service.complete_reservation(reservation_id=reservation_id)