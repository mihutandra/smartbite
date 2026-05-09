from uuid import UUID
import logging
from sqlalchemy import select, func
from sqlalchemy.orm import Session
from app.models.supermarket import Supermarket

EARTH_RADIUS_KM = 6371.0
logger = logging.getLogger(__name__)

def _distance_km_expr(lat_col, lng_col, user_lat: float, user_lng: float):
    """SQLAlchemy expression for Haversine distance in km between
    a row's (lat_col, lng_col) and a fixed (user_lat, user_lng)."""
    return EARTH_RADIUS_KM * func.acos(
        func.least(
            1.0,
            func.cos(func.radians(user_lat))
            * func.cos(func.radians(lat_col))
            * func.cos(func.radians(lng_col) - func.radians(user_lng))
            + func.sin(func.radians(user_lat)) * func.sin(func.radians(lat_col)),
        )
    )

class SupermarketRepository:
    def __init__(self, session: Session):
        self.session = session

    def get_by_id(self, id: UUID) -> Supermarket | None:
        logger.debug("Fetching supermarket id=%s", id)
        stmt = select(Supermarket).where(Supermarket.id == id)
        result = self.session.scalars(stmt).first()
        if result:
            logger.info("Found supermarket id=%s name=%s", id, result.name)
        else:
            logger.warning("Supermarket id=%s not found", id)
        return result

    def get_all(self, limit: int, offset: int) -> list[Supermarket]:
        logger.debug("Fetching all supermarkets limit=%s offset=%s", limit, offset)
        stmt = (
            select(Supermarket)
            .order_by(Supermarket.name)
            .limit(limit)
            .offset(offset)
        )
        result = list(self.session.scalars(stmt).all())
        logger.info("Retrieved %s supermarket(s)", len(result))
        return result
    
    def get_details(self, id: UUID) -> Supermarket | None:
        logger.debug("Fetching supermarket details id=%s", id)
        stmt = select(Supermarket).where(Supermarket.id == id)
        result = self.session.scalars(stmt).first()
        if result:
            logger.info("Found supermarket details id=%s name=%s", id, result.name)
        else:
            logger.warning("Supermarket details id=%s not found", id)
        return result
    
    def get_in_bounds(self, south: float, north: float, west: float, east: float, limit: int,) -> list[Supermarket]:
        # Latitude filter
        lat_filter = Supermarket.latitude.between(south, north)

        # Longitude filter handle antimeridian crossing (west > east means the box wraps)
        if west <= east:
            lng_filter = Supermarket.longitude.between(west, east)
        else:
            lng_filter = (Supermarket.longitude >= west) | (Supermarket.longitude <= east)

        stmt = (
            select(Supermarket)
            .where(
                Supermarket.is_active.is_(True),
                lat_filter,
                lng_filter,
            )
            .order_by(Supermarket.name)
            .limit(limit)
        )
        result = list(self.session.scalars(stmt).all())
        logger.info("Retrieved %s supermarket(s) within bounds", len(result))
        return result
    
    def get_all_with_distance(self, user_lat: float, user_lng: float, limit: int, offset: int, radius_km: float | None = None) -> list[tuple[Supermarket, float]]:
        """Return active supermarkets with distance from user, sorted nearest first.
        
        Returns a list of (Supermarket, distance_km) tuples.
        """
        logger.debug(
            "Fetching supermarkets with distance user_lat=%s user_lng=%s "
            "radius_km=%s limit=%s offset=%s",
            user_lat, user_lng, radius_km, limit, offset,
        )

        distance_expr = _distance_km_expr(
            Supermarket.latitude, Supermarket.longitude, user_lat, user_lng,
        ).label("distance_km")

        stmt = select(Supermarket, distance_expr).where(Supermarket.is_active.is_(True))

        if radius_km is not None:
            stmt = stmt.where(distance_expr <= radius_km)

        stmt = stmt.order_by(distance_expr).limit(limit).offset(offset)

        rows = self.session.execute(stmt).all()
        result = [(row[0], float(row[1])) for row in rows]
        logger.info("Retrieved %s supermarket(s) with distance", len(result))
        return result