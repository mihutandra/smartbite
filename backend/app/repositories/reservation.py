from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models.reservation import Reservation, ReservationItem
from app.models.supermarket_products import SupermarketProduct

_RESERVATION_LOAD_OPTIONS = (
    joinedload(Reservation.items)
    .joinedload(ReservationItem.supermarket_product)
    .joinedload(SupermarketProduct.product),
    joinedload(Reservation.items)
    .joinedload(ReservationItem.supermarket_product)
    .joinedload(SupermarketProduct.supermarket),
)

class ReservationRepository:
    def __init__(self, session: Session):
        self.session = session

    def get_by_user_id(self, user_id: UUID, status: str | None = None) -> list[Reservation]:
        stmt = (
            select(Reservation)
            .options(*_RESERVATION_LOAD_OPTIONS)
            .where(Reservation.user_id == user_id)
            .order_by(Reservation.created_at.desc())
        )

        if status is not None:
            stmt = stmt.where(Reservation.status == status)

        return list(self.session.scalars(stmt).unique().all())

    def get_inactive_by_user_id(self, user_id: UUID) -> list[Reservation]:
        """Every reservation for this user with a status other than active.
        "inactive" itself is never a stored value - it's purely this
        exclusion filter."""
        stmt = (
            select(Reservation)
            .options(*_RESERVATION_LOAD_OPTIONS)
            .where(Reservation.user_id == user_id, Reservation.status != "active")
            .order_by(Reservation.created_at.desc())
        )
        return list(self.session.scalars(stmt).unique().all())

    def get_by_id(self, reservation_id: UUID) -> Reservation | None:
        """Unscoped lookup - not tied to a particular user. Needed for
        manager actions (e.g. completing a pickup), where the caller isn't
        the reservation's owner."""
        stmt = (
            select(Reservation)
            .options(*_RESERVATION_LOAD_OPTIONS)
            .where(Reservation.id == reservation_id)
        )
        return self.session.scalars(stmt).unique().first()

    def get_by_id_for_user(self, reservation_id: UUID, user_id: UUID) -> Reservation | None:
        stmt = (
            select(Reservation)
            .options(*_RESERVATION_LOAD_OPTIONS)
            .where(
                Reservation.id == reservation_id,
                Reservation.user_id == user_id,
            )
        )
        return self.session.scalars(stmt).unique().first()

    def save(self, reservation: Reservation) -> Reservation:
        self.session.add(reservation)
        self.session.commit()
        self.session.refresh(reservation)
        return reservation
    