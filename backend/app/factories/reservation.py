from fastapi import Depends
from sqlalchemy.orm import Session

from app.core.database import get_session
from app.repositories.reservation import ReservationRepository
from app.repositories.user_repository import UserRepository
from app.services.reservation import ReservationService


def get_reservation_service(
    db_session: Session = Depends(get_session),
) -> ReservationService:
    reservation_repo = ReservationRepository(session=db_session)
    user_repo = UserRepository(session=db_session)
    return ReservationService(
        reservation_repo=reservation_repo,
        user_repo=user_repo,
    )
