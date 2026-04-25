from fastapi import Depends
from sqlalchemy.orm import Session

from app.core.database import get_session
from app.repositories.shopping_cart import ShoppingCartRepository
from app.repositories.supermarket_product import SupermarketProductRepository
from app.repositories.user_repository import UserRepository
from app.services.shopping_cart import ShoppingCartService


def get_shopping_cart_repository(
    db_session: Session = Depends(get_session),
) -> ShoppingCartRepository:
    return ShoppingCartRepository(session=db_session)


def get_shopping_cart_service(
    shopping_cart_repo: ShoppingCartRepository = Depends(get_shopping_cart_repository),
    db_session: Session = Depends(get_session),
) -> ShoppingCartService:
    user_repo = UserRepository(session=db_session)
    supermarket_product_repo = SupermarketProductRepository(session=db_session)
    return ShoppingCartService(
        shopping_cart_repo=shopping_cart_repo,
        user_repo=user_repo,
        supermarket_product_repo=supermarket_product_repo,
    )
