from fastapi import Depends
from sqlalchemy.orm import Session

from app.core.database import get_session
from app.repositories.order import OrderRepository
from app.repositories.user_repository import UserRepository
from app.services.order import OrderService


def get_order_repository(db_session: Session = Depends(get_session)) -> OrderRepository:
    return OrderRepository(session=db_session)


def get_order_service(
    order_repo: OrderRepository = Depends(get_order_repository),
    db_session: Session = Depends(get_session),
) -> OrderService:
    user_repo = UserRepository(session=db_session)
    return OrderService(order_repo=order_repo, user_repo=user_repo)
