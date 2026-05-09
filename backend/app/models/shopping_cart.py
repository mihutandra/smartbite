import uuid
from sqlalchemy import UUID, Boolean, CheckConstraint, Column, DateTime, ForeignKey, Integer, UniqueConstraint, func
from sqlalchemy.orm import relationship
from app.core.database import Base


class ShoppingCart(Base):
    __tablename__ = "shopping_cart"
    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "supermarket_product_id",
            name="uq_cart_user_supermarket_product"
        ),
        CheckConstraint("quantity > 0", name="ck_cart_quantity_positive"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    supermarket_product_id = Column(
        UUID(as_uuid=True),
        ForeignKey("supermarket_products.id"),
        nullable=False,
        index=True,
    )
    quantity = Column(Integer, nullable=False, default=1)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )
    user = relationship("User", back_populates="shopping_cart_items")
    supermarket_product = relationship(
        "SupermarketProduct",
        back_populates="shopping_cart_items"
    )
