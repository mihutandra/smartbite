import uuid
from sqlalchemy import UUID, Boolean, Column, Date, ForeignKey, Integer, Numeric, String, UniqueConstraint
from app.core.database import Base

class SupermarketProduct(Base):
    __tablename__ = "supermarket_products"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    supermarket_id = Column(UUID(as_uuid=True), ForeignKey("supermarkets.id"), nullable=False)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"), nullable=False)

    # Pricing & Expiry logic
    original_price = Column(Numeric(10, 2), nullable=False)
    discount_price = Column(Numeric(10, 2), nullable=False)
    currency = Column(String, default="RON")
    
    expiration_date = Column(Date, nullable=False) 
    stock_quantity = Column(Integer, default=0)    
    
    store_product_code = Column(String, nullable=True)
    is_available = Column(Boolean, default=True)

    # Update the constraint to include expiration_date
    __table_args__ = (
        UniqueConstraint("supermarket_id", "product_id", "expiration_date", name="uq_supermarket_product_batch"),
    )
    