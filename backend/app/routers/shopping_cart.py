from uuid import UUID

from fastapi import APIRouter, Depends

from app.auth.jwt_utils import verify_jwt
from app.factories.shopping_cart import get_shopping_cart_service
from app.schemas.shopping_cart import (
    ReservationOut,
    ShoppingCartAddIn,
    ShoppingCartAddOut,
    ShoppingCartConfirmIn,
    ShoppingCartItemOut,
    ShoppingCartSavingsOut,
)
from app.services.shopping_cart import ShoppingCartService


router = APIRouter(prefix="/api/shopping-cart", tags=["ShoppingCart"])


@router.get("/", response_model=list[ShoppingCartItemOut])
def get_my_shopping_cart(
    current_user: dict = Depends(verify_jwt),
    service: ShoppingCartService = Depends(get_shopping_cart_service),
):
    user_id = UUID(current_user["user_id"])
    return service.get_user_cart(user_id=user_id)


@router.get("/savings", response_model=ShoppingCartSavingsOut)
def get_my_shopping_cart_savings(
    current_user: dict = Depends(verify_jwt),
    service: ShoppingCartService = Depends(get_shopping_cart_service),
):
    user_id = UUID(current_user["user_id"])
    return service.get_user_cart_savings(user_id=user_id)


@router.post("/", response_model=ShoppingCartAddOut)
def add_to_shopping_cart(
    payload: ShoppingCartAddIn,
    current_user: dict = Depends(verify_jwt),
    service: ShoppingCartService = Depends(get_shopping_cart_service),
):
    user_id = UUID(current_user["user_id"])
    return service.add_item(
        user_id=user_id,
        supermarket_product_id=payload.supermarket_product_id,
        quantity=payload.quantity,
        confirm_replace=payload.confirm_replace,
    )


@router.delete("/{cart_item_id}", response_model=ShoppingCartAddOut)
def remove_from_shopping_cart(
    cart_item_id: UUID,
    current_user: dict = Depends(verify_jwt),
    service: ShoppingCartService = Depends(get_shopping_cart_service),
):
    user_id = UUID(current_user["user_id"])
    return service.remove_item(user_id=user_id, cart_item_id=cart_item_id)


@router.post("/confirm", response_model=ReservationOut)
def confirm_shopping_cart(
    payload: ShoppingCartConfirmIn,
    current_user: dict = Depends(verify_jwt),
    service: ShoppingCartService = Depends(get_shopping_cart_service),
):
    user_id = UUID(current_user["user_id"])
    return service.confirm_cart(user_id=user_id, payload=payload)
