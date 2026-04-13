from uuid import UUID
from fastapi import APIRouter, Depends, Query
from app.factories.supermarket import get_supermarket_service
from app.schemas.supermarket import SupermarketOut
from app.services.supermarket import SupermarketService

router = APIRouter(prefix="/api/supermarkets", tags=["Supermarkets"])

@router.get("/", response_model=list[SupermarketOut])
def list_supermarkets(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    service: SupermarketService = Depends(get_supermarket_service),
):
    return service.list_all(page=page, page_size=page_size)

@router.get("/{supermarket_id}", response_model=SupermarketOut)
def get_supermarket(
    supermarket_id: UUID,
    service: SupermarketService = Depends(get_supermarket_service),
):
    return service.get_by_id(supermarket_id=supermarket_id)