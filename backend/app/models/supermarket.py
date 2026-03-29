from datetime import datetime
from time import timezone
import uuid
from sqlalchemy import UUID, Boolean, Column, DateTime, Float, JSON, String
from sqlalchemy.orm import relationship
from app.core.database import Base


class Supermarket(Base):
    __tablename__ = "supermarkets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    address = Column(String, nullable=False)

    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)

    phone_number = Column(String)
    email = Column(String)
    website = Column(String)

    opening_hours = Column(JSON)

    is_active = Column(Boolean, default=True)

    created_at = Column(DateTime, default=datetime.now(timezone.utc))
    updated_at = Column(DateTime, onupdate=datetime.now(timezone.utc))
    
    supermarket_products = relationship("SupermarketProduct", back_populates="supermarket")
    