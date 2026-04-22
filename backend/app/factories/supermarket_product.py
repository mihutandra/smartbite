from fastapi import Depends
from sqlalchemy.orm import Session
from app.core.database import get_session
from app.repositories.supermarket_product import SupermarketProductRepository
from app.services.supermarket_product import SupermarketProductService
from app.repositories.supermarket import SupermarketRepository


def get_supermarket_product_repository(
    db_session: Session = Depends(get_session),
) -> SupermarketProductRepository:
    return SupermarketProductRepository(session=db_session)

def get_supermarket_repository(
        db_session: Session = Depends(get_session),
) -> SupermarketRepository:
    return SupermarketRepository(session=db_session)


def get_supermarket_product_service(
        supermarket_product_repo: SupermarketProductRepository = Depends(get_supermarket_product_repository),
        supermarket_repo: SupermarketRepository = Depends(get_supermarket_repository),
) -> SupermarketProductService:
    return SupermarketProductService(
        supermarket_product_repo=supermarket_product_repo,
        supermarket_repo=supermarket_repo,
    )
