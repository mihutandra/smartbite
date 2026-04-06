from fastapi import Depends
from sqlalchemy.orm import Session
from app.core.database import get_session
from app.repositories.supermarket_product import SupermarketProductRepository


def get_supermarket_product_repository(
    db_session: Session = Depends(get_session),
) -> SupermarketProductRepository:
    return SupermarketProductRepository(session=db_session)
