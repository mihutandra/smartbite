from fastapi import Depends
from sqlalchemy.orm import Session
from app.core.database import get_session
from app.repositories.product import ProductRepository
from app.services.product import ProductService


def get_product_repository(db_session: Session = Depends(get_session)) -> ProductRepository:
    return ProductRepository(session=db_session)


def get_product_service(
    product_repo: ProductRepository = Depends(get_product_repository),
) -> ProductService:
    return ProductService(product_repo=product_repo)
