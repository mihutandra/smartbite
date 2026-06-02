from uuid import UUID
from app.exceptions.exceptions import NotFound, ValidationError
from app.models.supermarket import Supermarket
from app.repositories.supermarket import SupermarketRepository
from app.schemas.supermarket import SupermarketDetails, SupermarketWithDistance


class SupermarketService:
    def __init__(self, supermarket_repo: SupermarketRepository):
        self.supermarket_repo = supermarket_repo

    def list_all(self, page: int, page_size: int) -> list[Supermarket]:
        offset = (page - 1) * page_size
        return self.supermarket_repo.get_all(limit=page_size, offset=offset)

    def get_by_id(self, supermarket_id: UUID) -> Supermarket:
        supermarket = self.supermarket_repo.get_by_id(supermarket_id)
        if not supermarket:
            raise NotFound(entity="Supermarket", identifier=str(supermarket_id))
        return supermarket
    
    def get_details(self, supermarket_id: UUID) -> SupermarketDetails:
        supermarket = self.supermarket_repo.get_details(supermarket_id)
        if not supermarket:
            raise NotFound(entity="Supermarket", identifier=str(supermarket_id))
        return supermarket
    
    def get_in_bounds(
        self,
        south: float,
        north: float,
        west: float,
        east: float,
        limit: int,
        user_lat: float | None = None,
        user_lng: float | None = None,
    ) -> list[tuple[Supermarket, int, float | None]]:
        # Latitude sanity
        if south > north:
            raise ValidationError(
                "Invalid bounds: 'south' must be less than or equal to 'north'.",
                field="south",
            )
        if not (-90 <= south <= 90) or not (-90 <= north <= 90):
            raise ValidationError(
                "Latitude bounds must be between -90 and 90.",
                field="latitude",
            )
        if not (-180 <= west <= 180) or not (-180 <= east <= 180):
            raise ValidationError(
                "Longitude bounds must be between -180 and 180.",
                field="longitude",
            )
        if (user_lat is None) != (user_lng is None):
            raise ValidationError(
                "user_lat and user_lng must both be provided together.",
                field="user_lat" if user_lat is None else "user_lng",
            )
        if user_lat is not None and user_lng is not None:
            self._validate_coords(user_lat, user_lng)

        return self.supermarket_repo.get_in_bounds(
            south=south,
            north=north,
            west=west,
            east=east,
            limit=limit,
            user_lat=user_lat,
            user_lng=user_lng,
        )
        
    @staticmethod
    def _validate_coords(lat: float, lng: float) -> None:
        if not (-90 <= lat <= 90):
            raise ValidationError("Latitude must be between -90 and 90.", field="user_lat")
        if not (-180 <= lng <= 180):
            raise ValidationError("Longitude must be between -180 and 180.", field="user_lng")
        
    def list_all_with_distance(
        self,
        user_lat: float,
        user_lng: float,
        page: int,
        page_size: int,
        radius_km: float | None = None,
    ) -> list[SupermarketWithDistance]:
        self._validate_coords(user_lat, user_lng)
        if radius_km is not None and radius_km <= 0:
            raise ValidationError("radius_km must be positive.", field="radius_km")

        offset = (page - 1) * page_size
        rows = self.supermarket_repo.get_all_with_distance(
            user_lat=user_lat,
            user_lng=user_lng,
            limit=page_size,
            offset=offset,
            radius_km=radius_km,
        )
        return [
            SupermarketWithDistance.model_validate(
                {**supermarket.__dict__, "distance_km": round(distance, 2)}
            )
            for supermarket, distance in rows
        ]