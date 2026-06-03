from uuid import UUID

from fastapi import APIRouter, Depends

from app.auth.jwt_utils import verify_jwt
from app.factories.order import get_order_service
from app.models.enums import OrderStatus
from app.schemas.order import OrderOut, UserOrdersOut
from app.services.order import OrderService


router = APIRouter(prefix="/api/orders", tags=["Orders"])


@router.get("/", response_model=UserOrdersOut)
def get_my_orders(
    current_user: dict = Depends(verify_jwt),
    service: OrderService = Depends(get_order_service),
):
    user_id = UUID(current_user["user_id"])
    return service.get_user_orders(user_id=user_id)


@router.get("/active", response_model=list[OrderOut])
def get_my_active_orders(
    current_user: dict = Depends(verify_jwt),
    service: OrderService = Depends(get_order_service),
):
    user_id = UUID(current_user["user_id"])
    return service.get_user_orders_by_status(user_id=user_id, status=OrderStatus.ACTIVE)


@router.get("/done", response_model=list[OrderOut])
def get_my_done_orders(
    current_user: dict = Depends(verify_jwt),
    service: OrderService = Depends(get_order_service),
):
    user_id = UUID(current_user["user_id"])
    return service.get_user_orders_by_status(user_id=user_id, status=OrderStatus.DONE)
