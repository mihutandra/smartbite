import logging
from uuid import UUID
from fastapi import APIRouter, Depends, Query
from app.factories.supermarket_product import get_supermarket_product_service
from app.schemas.supermarket_product import SupermarketProductOut
from app.services.supermarket_product import SupermarketProductService

logger = logging.getLogger(__name__)

DEFAULT_PAGE_SIZE = 10
MAX_PAGE_SIZE = 100
PAGE_DESCRIPTION = "Page number (starts from 1)"
PAGE_SIZE_DESCRIPTION = "Number of items per page"

router = APIRouter(prefix="/api/supermarket-products", tags=["SupermarketProducts"])


@router.get("/", response_model=list[SupermarketProductOut])
def list_supermarket_products(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    service: SupermarketProductService = Depends(get_supermarket_product_service),
):
    return service.list_all(page=page, page_size=page_size)


@router.get("/search", response_model=list[SupermarketProductOut])
def search_supermarket_products(
    item: str = Query(..., min_length=1),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    service: SupermarketProductService = Depends(get_supermarket_product_service),
):
    return service.search_by_product_name(query=item, page=page, page_size=page_size)


@router.get("/{supermarket_product_id}", response_model=SupermarketProductOut)
def get_supermarket_product(
    supermarket_product_id: UUID,
    service: SupermarketProductService = Depends(get_supermarket_product_service),
):
    return service.get_by_id(supermarket_product_id=supermarket_product_id)

@router.get("/{supermarket_id}/products", response_model=list[SupermarketProductOut])
def get_products_by_supermarket(
        supermarket_id: UUID,
        page: int = Query(1, ge=1, description=PAGE_DESCRIPTION),
        page_size: int = Query(
            DEFAULT_PAGE_SIZE, ge=1, le=MAX_PAGE_SIZE, description=PAGE_SIZE_DESCRIPTION
        ),
        service: SupermarketProductService = Depends(get_supermarket_product_service),
):
    logger.debug("GET /api/supermarkets/%s/products page=%s page_size=%s", supermarket_id, page, page_size)
    result = service.get_products_by_supermarket(
        supermarket_id=supermarket_id,
        page=page,
        page_size=page_size,
    )
    logger.info("Retrieved %s product(s) for supermarket_id=%s", len(result), supermarket_id)
    return result