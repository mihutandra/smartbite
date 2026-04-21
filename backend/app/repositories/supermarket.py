from uuid import UUID
import logging
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.supermarket import Supermarket


logger = logging.getLogger(__name__)


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