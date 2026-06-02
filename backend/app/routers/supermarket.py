
from typing import Union
from uuid import UUID
from fastapi import APIRouter, Depends, Query
from app.exceptions.exceptions import ValidationError
from app.factories.supermarket import get_supermarket_service
from app.schemas.supermarket import SupermarketDetails, SupermarketOut, SupermarketMapMarker, SupermarketWithDistance
from app.services.supermarket import SupermarketService

router = APIRouter(prefix="/api/supermarkets", tags=["Supermarkets"])

@router.get(
    "/",
    response_model=Union[list[SupermarketWithDistance], list[SupermarketOut]],
)
def list_supermarkets(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    user_lat: float | None = Query(
        None, ge=-90, le=90, description="User's latitude — enables distance sorting"
    ),
    user_lng: float | None = Query(
        None, ge=-180, le=180, description="User's longitude — enables distance sorting"
    ),
    radius_km: float | None = Query(
        None, gt=0, le=20000, description="Optional max distance in km from user"
    ),
    service: SupermarketService = Depends(get_supermarket_service),
):
    # Both location params must be provided together
    if (user_lat is None) != (user_lng is None):
        raise ValidationError(
            "user_lat and user_lng must both be provided.",
            field="user_lat" if user_lat is None else "user_lng",
        )

    if user_lat is not None and user_lng is not None:
        return service.list_all_with_distance(
            user_lat=user_lat,
            user_lng=user_lng,
            page=page,
            page_size=page_size,
            radius_km=radius_km,
        )

    if radius_km is not None:
        raise ValidationError(
            "radius_km requires user_lat and user_lng.",
            field="radius_km",
        )

    return service.list_all(page=page, page_size=page_size)

@router.get("/map/in-bounds", response_model=list[SupermarketMapMarker])
def list_supermarkets_in_bounds(
    south: float = Query(..., ge=-90, le=90),
    north: float = Query(..., ge=-90, le=90),
    west: float = Query(..., ge=-180, le=180),
    east: float = Query(..., ge=-180, le=180),
    limit: int = Query(500, ge=1, le=2000),
    user_lat: float | None = Query(None, ge=-90, le=90),
    user_lng: float | None = Query(None, ge=-180, le=180),
    service: SupermarketService = Depends(get_supermarket_service),
):
    rows = service.get_in_bounds(
        south=south,
        north=north,
        west=west,
        east=east,
        limit=limit,
        user_lat=user_lat,
        user_lng=user_lng,
    )
    return [
        SupermarketMapMarker.model_validate({
            **sm.__dict__,
            "offers_count": offers_count,
            "distance_km": round(distance, 2) if distance is not None else None,
        })
        for sm, offers_count, distance in rows
    ]

@router.get("/{supermarket_id}", response_model=SupermarketOut)
def get_supermarket(
    supermarket_id: UUID,
    service: SupermarketService = Depends(get_supermarket_service),
):
    return service.get_by_id(supermarket_id=supermarket_id)

@router.get("/{supermarket_id}/details", response_model=SupermarketDetails)
def get_supermarket_details(
    supermarket_id: UUID,
    service: SupermarketService = Depends(get_supermarket_service),
):
    return service.get_details(supermarket_id=supermarket_id)
