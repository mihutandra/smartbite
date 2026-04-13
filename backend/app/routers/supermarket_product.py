from uuid import UUID
from fastapi import APIRouter, Depends, Query
from app.factories.supermarket_product import get_supermarket_product_service
from app.schemas.supermarket_product import SupermarketProductOut
from app.services.supermarket_product import SupermarketProductService


router = APIRouter(prefix="/api/supermarket-products", tags=["SupermarketProducts"])


@router.get("/", response_model=list[SupermarketProductOut])
def list_supermarket_products(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    service: SupermarketProductService = Depends(get_supermarket_product_service),
):
    return service.list_all(page=page, page_size=page_size)


@router.get("/{supermarket_product_id}", response_model=SupermarketProductOut)
def get_supermarket_product(
    supermarket_product_id: UUID,
    service: SupermarketProductService = Depends(get_supermarket_product_service),
):
    return service.get_by_id(supermarket_product_id=supermarket_product_id)
