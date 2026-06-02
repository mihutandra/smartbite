from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models.reservation import Reservation, ReservationItem
from app.models.supermarket_products import SupermarketProduct


class ReservationRepository:
    def __init__(self, session: Session):
        self.session = session

    def get_by_user_id(self, user_id: UUID, status: str | None = None) -> list[Reservation]:
        stmt = (
            select(Reservation)
            .options(
                joinedload(Reservation.items)
                .joinedload(ReservationItem.supermarket_product)
                .joinedload(SupermarketProduct.product),
                joinedload(Reservation.items)
                .joinedload(ReservationItem.supermarket_product)
                .joinedload(SupermarketProduct.supermarket),
            )
            .where(Reservation.user_id == user_id)
            .order_by(Reservation.created_at.desc())
        )

        if status is not None:
            stmt = stmt.where(Reservation.status == status)

        return list(self.session.scalars(stmt).unique().all())

    def get_by_id_for_user(self, reservation_id: UUID, user_id: UUID) -> Reservation | None:
        stmt = (
            select(Reservation)
            .options(
                joinedload(Reservation.items)
                .joinedload(ReservationItem.supermarket_product)
                .joinedload(SupermarketProduct.product),
                joinedload(Reservation.items)
                .joinedload(ReservationItem.supermarket_product)
                .joinedload(SupermarketProduct.supermarket),
            )
            .where(
                Reservation.id == reservation_id,
                Reservation.user_id == user_id,
            )
        )
        return self.session.scalars(stmt).unique().first()
