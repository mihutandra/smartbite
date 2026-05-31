from uuid import UUID
import logging
from sqlalchemy import select, func
from sqlalchemy.orm import Session
from app.models.supermarket import Supermarket
from app.models.supermarket_products import SupermarketProduct

EARTH_RADIUS_KM = 6371.0
logger = logging.getLogger(__name__)

def _distance_km_expr(lat_col, lng_col, user_lat: float, user_lng: float):
    """SQLAlchemy expression for Haversine distance in km between
    a row's (lat_col, lng_col) and a fixed (user_lat, user_lng).

    Clamped to [-1.0, 1.0] before acos() to avoid NaN from floating-point
    drift when the two points are (nearly) identical or antipodal.
    """
    inner = (
        func.cos(func.radians(user_lat))
        * func.cos(func.radians(lat_col))
        * func.cos(func.radians(lng_col) - func.radians(user_lng))
        + func.sin(func.radians(user_lat)) * func.sin(func.radians(lat_col))
    )
    return EARTH_RADIUS_KM * func.acos(func.greatest(-1.0, func.least(1.0, inner)))

def _offers_count_expr():
    """Correlated subquery: count of available offers for a supermarket row.
    Available = is_available IS TRUE AND stock_quantity > 0."""
    return (
        select(func.count(SupermarketProduct.id))
        .where(
            SupermarketProduct.supermarket_id == Supermarket.id,
            SupermarketProduct.is_available.is_(True),
            SupermarketProduct.stock_quantity > 0,
        )
        .correlate(Supermarket)
        .scalar_subquery()
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
        """Returns list of (supermarket, offers_count, distance_km | None)."""
        logger.debug(
            "Fetching supermarkets in bounds s=%s n=%s w=%s e=%s "
            "user_lat=%s user_lng=%s limit=%s",
            south, north, west, east, user_lat, user_lng, limit,
        )

        lat_filter = Supermarket.latitude.between(south, north)
        if west <= east:
            lng_filter = Supermarket.longitude.between(west, east)
        else:
            lng_filter = (Supermarket.longitude >= west) | (Supermarket.longitude <= east)

        offers_count_expr = _offers_count_expr().label("offers_count")

        if user_lat is not None and user_lng is not None:
            distance_expr = _distance_km_expr(
                Supermarket.latitude, Supermarket.longitude, user_lat, user_lng,
            ).label("distance_km")
            stmt = (
                select(Supermarket, offers_count_expr, distance_expr)
                .where(Supermarket.is_active.is_(True), lat_filter, lng_filter)
                .order_by(distance_expr)
                .limit(limit)
            )
        else:
            stmt = (
                select(Supermarket, offers_count_expr)
                .where(Supermarket.is_active.is_(True), lat_filter, lng_filter)
                .order_by(Supermarket.name)
                .limit(limit)
            )

        rows = self.session.execute(stmt).all()
        if user_lat is not None and user_lng is not None:
            result = [(r[0], int(r[1] or 0), float(r[2])) for r in rows]
        else:
            result = [(r[0], int(r[1] or 0), None) for r in rows]

        logger.info("Retrieved %s supermarket(s) within bounds", len(result))
        return result
    
    def get_all_with_distance(
        self,
        user_lat: float,
        user_lng: float,
        limit: int,
        offset: int,
        radius_km: float | None = None,
    ) -> list[tuple[Supermarket, float]]:
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