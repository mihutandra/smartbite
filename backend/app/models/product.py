from datetime import datetime
import uuid
from sqlalchemy import UUID, Boolean, Column, DateTime, String, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    name = Column(String, nullable=False)
    description = Column(Text)

    # TODO:
    # category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)

    brand = Column(String)

    image_url = Column(String)

    is_active = Column(Boolean, default=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, onupdate=datetime.utcnow)
    
    supermarket_products = relationship("SupermarketProduct", back_populates="product")
    