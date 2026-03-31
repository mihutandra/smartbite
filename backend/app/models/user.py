from sqlalchemy import String, DateTime, func, Enum
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base
from app.models.enums import UserType


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String, nullable=False)
    name: Mapped[str] = mapped_column(String, nullable=False)
    user_type: Mapped[UserType] = mapped_column(
        Enum(UserType),
        default=UserType.USER,
        nullable=False,
    )
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )