from uuid import UUID
from fastapi import APIRouter, Depends, Query, status
from app.factories.product import get_product_service
from app.schemas.product import ProductCreate, ProductOut
from app.services.product import ProductService


router = APIRouter(prefix="/api/products", tags=["Products"])


@router.get("/", response_model=list[ProductOut])
def list_products(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    service: ProductService = Depends(get_product_service),
):
    return service.list_all(page=page, page_size=page_size)


@router.get("/{product_id}", response_model=ProductOut)
def get_product(
    product_id: UUID,
    service: ProductService = Depends(get_product_service),
):
    return service.get_by_id(product_id=product_id)


@router.post("/", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
def create_product(
    payload: ProductCreate,
    service: ProductService = Depends(get_product_service),
):
    return service.create(product_data=payload)
