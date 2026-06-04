from uuid import UUID

from app.exceptions.exceptions import NotFound
from app.models.reservation import Reservation
from app.repositories.reservation import ReservationRepository
from app.repositories.user_repository import UserRepository
from app.schemas.reservation import ReservationItemOut, ReservationOut, ReservationStatus


class ReservationService:
    def __init__(
        self,
        reservation_repo: ReservationRepository,
        user_repo: UserRepository,
    ):
        self.reservation_repo = reservation_repo
        self.user_repo = user_repo

    def get_user_reservations(
        self,
        user_id: UUID,
        status: ReservationStatus | None = None,
    ) -> list[ReservationOut]:
        user = self.user_repo.get_by_id(user_id)
        if user is None or user.is_deleted:
            raise NotFound(entity="User", identifier=str(user_id))

        reservations = self.reservation_repo.get_by_user_id(user_id=user_id, status=status)
        return [self._to_out(reservation) for reservation in reservations]

    def get_user_reservation(self, user_id: UUID, reservation_id: UUID) -> ReservationOut:
        user = self.user_repo.get_by_id(user_id)
        if user is None or user.is_deleted:
            raise NotFound(entity="User", identifier=str(user_id))

        reservation = self.reservation_repo.get_by_id_for_user(
            reservation_id=reservation_id,
            user_id=user_id,
        )
        if reservation is None:
            raise NotFound(entity="Reservation", identifier=str(reservation_id))

        return self._to_out(reservation)

    def _to_out(self, reservation: Reservation) -> ReservationOut:
        return ReservationOut(
            id=reservation.id,
            status=reservation.status,
            created_at=reservation.created_at,
            updated_at=reservation.updated_at,
            items=[
                ReservationItemOut(
                    id=item.id,
                    supermarket_product_id=item.supermarket_product_id,
                    quantity=item.quantity,
                    reserved_price=item.reserved_price,
                    currency=item.currency,
                    product_id=item.supermarket_product.product_id if item.supermarket_product else None,
                    product_name=(
                        item.supermarket_product.product.name
                        if item.supermarket_product and item.supermarket_product.product
                        else None
                    ),
                    product_image_url=(
                        item.supermarket_product.product.image_url
                        if item.supermarket_product and item.supermarket_product.product
                        else None
                    ),
                    supermarket_id=(
                        item.supermarket_product.supermarket_id if item.supermarket_product else None
                    ),
                    supermarket_name=(
                        item.supermarket_product.supermarket.name
                        if item.supermarket_product and item.supermarket_product.supermarket
                        else None
                    ),
                    expiration_date=(
                        item.supermarket_product.expiration_date if item.supermarket_product else None
                    ),
                )
                for item in reservation.items
            ],
        )
