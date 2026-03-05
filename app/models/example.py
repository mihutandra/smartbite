"""
from __future__ import annotations

from decimal import Decimal
import uuid
from app.models.enums import BrokerStatus
from sqlalchemy import String, CheckConstraint, Numeric
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from app.models.policy import Policy

class Broker(Base):
    __tablename__ = "brokers"
    __table_args__ = (
        CheckConstraint("status IN ('ACTIVE','INACTIVE')", name="ck_broker_status_enum"),
        CheckConstraint(
            "commission_percentage IS NULL OR (commission_percentage > 0 AND commission_percentage <= 100)",
            name="ck_broker_commission_range",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )   

    code: Mapped[str] = mapped_column(String(10), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(100), index=True)

    email: Mapped[str | None] = mapped_column(String(50), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(50), nullable=True)

    status: Mapped[BrokerStatus] = mapped_column(String(20), nullable=False, default=BrokerStatus.ACTIVE)

    commission_percentage: Mapped[Decimal | None] = mapped_column(Numeric(6, 3), nullable=True)

    policies: Mapped[list[Policy]] = relationship(back_populates="broker")

"""