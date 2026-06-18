from datetime import datetime, timedelta, timezone
from uuid import UUID
from decimal import Decimal

from app.exceptions.exceptions import NotFound, StatusError
from app.models.reservation import Reservation
from app.repositories.reservation import ReservationRepository
from app.repositories.user_repository import UserRepository
from app.schemas.reservation import ReservationItemOut, ReservationOut, ReservationStatus
from app.schemas.user import ProfileSavingsOut

RESERVATION_EXPIRATION_WINDOW = timedelta(hours=2)
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
        reservations = self._expire_all_if_needed(reservations)
        return [self._to_out(reservation) for reservation in reservations]
    
    def get_user_inactive_reservations(self, user_id: UUID) -> list[ReservationOut]:
        """Every reservation for this user with a status other than active."""
        user = self.user_repo.get_by_id(user_id)
        if user is None or user.is_deleted:
            raise NotFound(entity="User", identifier=str(user_id))

        reservations = self.reservation_repo.get_inactive_by_user_id(user_id=user_id)
        reservations = self._expire_all_if_needed(reservations)
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

        reservation = self._expire_if_needed(reservation)
        return self._to_out(reservation)

    def cancel_user_reservation(self, user_id: UUID, reservation_id: UUID) -> ReservationOut:
        user = self.user_repo.get_by_id(user_id)
        if user is None or user.is_deleted:
            raise NotFound(entity="User", identifier=str(user_id))

        reservation = self.reservation_repo.get_by_id_for_user(
            reservation_id=reservation_id,
            user_id=user_id,
        )
        if reservation is None:
            raise NotFound(entity="Reservation", identifier=str(reservation_id))

        reservation = self._expire_if_needed(reservation)

        if reservation.status != "active":
            raise StatusError(
                entity="Reservation",
                identifier=str(reservation_id),
                message="Only active reservations can be cancelled.",
            )

        try:
            self._release_stock(reservation)
            reservation.status = "cancelled"
            reservation = self.reservation_repo.save(reservation)
        except Exception:
            self.reservation_repo.session.rollback()
            raise

        return self._to_out(reservation)
    
    def complete_reservation(self, reservation_id: UUID) -> ReservationOut:
        """Mark a reservation as picked up. Triggered by a manager - not
        scoped to a particular user, since the manager confirming pickup
        isn't the reservation's owner."""
        reservation = self.reservation_repo.get_by_id(reservation_id)
        if reservation is None:
            raise NotFound(entity="Reservation", identifier=str(reservation_id))

        reservation = self._expire_if_needed(reservation)

        if reservation.status != "active":
            raise StatusError(
                entity="Reservation",
                identifier=str(reservation_id),
                message="Only active reservations can be completed.",
            )
        reservation.status = "completed"
        reservation = self.reservation_repo.save(reservation)

        return self._to_out(reservation)

    def get_user_total_savings(self, user_id: UUID) -> ProfileSavingsOut:
        user = self.user_repo.get_by_id(user_id)
        if user is None or user.is_deleted:
            raise NotFound(entity="User", identifier=str(user_id))

        reservations = self._expire_all_if_needed(
            self.reservation_repo.get_by_user_id(user_id=user_id)
        )

        total_savings = Decimal("0.00")
        for reservation in reservations:
            for item in reservation.items:
                supermarket_product = item.supermarket_product
                if supermarket_product is None:
                    continue

                savings_per_unit = supermarket_product.original_price - item.reserved_price
                total_savings += max(savings_per_unit, Decimal("0.00")) * Decimal(item.quantity)

        return ProfileSavingsOut(total_savings=total_savings)

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
    
    def _expire_if_needed(self, reservation: Reservation) -> Reservation:
        """If `reservation` is still active but past RESERVATION_EXPIRATION_WINDOW
        since it was created, transition it to expired and release its stock.
        There's no background job anywhere in this codebase, so this is checked
        lazily on every read rather than on a schedule."""
        if reservation.status != "active":
            return reservation

        age = datetime.now(timezone.utc) - reservation.created_at
        if age < RESERVATION_EXPIRATION_WINDOW:
            return reservation

        self._release_stock(reservation)
        reservation.status = "expired"
        return self.reservation_repo.save(reservation)

    def _expire_all_if_needed(self, reservations: list[Reservation]) -> list[Reservation]:
        return [self._expire_if_needed(reservation) for reservation in reservations]

    def _release_stock(self, reservation: Reservation) -> None:
        """Return a reservation's items to available stock. Shared by
        cancellation and expiration - in both cases the customer never
        actually took the items, so the hold should be released."""
        for item in reservation.items:
            supermarket_product = item.supermarket_product
            if supermarket_product is None:
                continue

            supermarket_product.stock_quantity = (supermarket_product.stock_quantity or 0) + item.quantity
            supermarket_product.is_available = supermarket_product.stock_quantity > 0
