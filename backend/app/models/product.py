from datetime import datetime, timezone
import uuid
from sqlalchemy import UUID, Boolean, Column, DateTime, ForeignKey, String, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    name = Column(String, nullable=False)
    description = Column(Text)

    category_id = Column(UUID(as_uuid=True), ForeignKey("categories.id"), nullable=False)

    brand = Column(String)

    image_url = Column(String)

    is_active = Column(Boolean, default=True)

    created_at = Column(DateTime, default=datetime.now(timezone.utc))
    updated_at = Column(DateTime, onupdate=datetime.now(timezone.utc))
    
    category = relationship("Category", back_populates="products")
    supermarket_products = relationship("SupermarketProduct", back_populates="product")
    
