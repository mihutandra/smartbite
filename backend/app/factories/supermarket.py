from fastapi import Depends
from sqlalchemy.orm import Session
from app.core.database import get_session
from app.repositories.supermarket import SupermarketRepository
from app.services.supermarket import SupermarketService


def get_supermarket_repository(
    db_session: Session = Depends(get_session),
) -> SupermarketRepository:
    return SupermarketRepository(session=db_session)


def get_supermarket_service(
    supermarket_repo: SupermarketRepository = Depends(get_supermarket_repository),
) -> SupermarketService:
    return SupermarketService(supermarket_repo=supermarket_repo)