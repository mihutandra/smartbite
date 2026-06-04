import uuid

from sqlalchemy import UUID, CheckConstraint, Column, DateTime, ForeignKey, Integer, Numeric, String, func
from sqlalchemy.orm import relationship

from app.core.database import Base


class Reservation(Base):
    __tablename__ = "reservations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    status = Column(String(20), nullable=False, default="active", index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    user = relationship("User", back_populates="reservations")
    items = relationship("ReservationItem", back_populates="reservation", cascade="all, delete-orphan")


class ReservationItem(Base):
    __tablename__ = "reservation_items"
    __table_args__ = (
        CheckConstraint("quantity > 0", name="ck_reservation_item_quantity_positive"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    reservation_id = Column(UUID(as_uuid=True), ForeignKey("reservations.id"), nullable=False, index=True)
    supermarket_product_id = Column(
        UUID(as_uuid=True),
        ForeignKey("supermarket_products.id"),
        nullable=False,
        index=True,
    )
    quantity = Column(Integer, nullable=False)
    reserved_price = Column(Numeric(10, 2), nullable=False)
    currency = Column(String, nullable=False, default="RON")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    reservation = relationship("Reservation", back_populates="items")
    supermarket_product = relationship("SupermarketProduct", back_populates="reservation_items")
