from uuid import UUID
import logging
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload
from app.models.product import Product
from app.models.supermarket_products import SupermarketProduct


logger = logging.getLogger(__name__)


class SupermarketProductRepository:
    def __init__(self, session: Session):
        self.session = session

    def get_by_id(self, id: UUID) -> SupermarketProduct | None:
        logger.debug("Fetching supermarket_product id=%s", id)
        stmt = (
            select(SupermarketProduct)
            .options(
                joinedload(SupermarketProduct.product).joinedload(Product.category),
                joinedload(SupermarketProduct.supermarket),
            )
            .where(SupermarketProduct.id == id)
        )
        result = self.session.scalars(stmt).first()
        if result:
            logger.info("Found supermarket_product id=%s", id)
        else:
            logger.warning("SupermarketProduct id=%s not found", id)
        return result

    def get_by_supermarket_id(
            self, supermarket_id: UUID, limit: int, offset: int
    ) -> list[SupermarketProduct]:
        logger.debug(
            "Fetching products for supermarket_id=%s limit=%s offset=%s",
            supermarket_id, limit, offset,
        )
        stmt = (
            select(SupermarketProduct)
            .where(SupermarketProduct.supermarket_id == supermarket_id)
            .where(SupermarketProduct.is_available.is_(True))
            .options(
                joinedload(SupermarketProduct.product).joinedload(Product.category),
                joinedload(SupermarketProduct.supermarket),
            )
            .order_by(SupermarketProduct.expiration_date)
            .limit(limit)
            .offset(offset)
        )
        result = list(self.session.scalars(stmt).unique().all())
        logger.info(
            "Retrieved %s product(s) for supermarket_id=%s", len(result), supermarket_id
        )
        return result

    def get_all(self, limit: int, offset: int) -> list[SupermarketProduct]:
        logger.debug("Fetching all supermarket_products limit=%s, offset=%s", limit, offset)
        stmt = (
            select(SupermarketProduct)
            .options(
                joinedload(SupermarketProduct.product).joinedload(Product.category),
                joinedload(SupermarketProduct.supermarket),
            )
            .order_by(SupermarketProduct.expiration_date)
            .limit(limit)
            .offset(offset)
        )
        result = list(self.session.scalars(stmt).all())
        logger.info("Retrieved %s supermarket_product row(s)", len(result))
        return result

    def search_by_product_name(self, query: str, limit: int, offset: int) -> list[SupermarketProduct]:
        logger.debug(
            "Searching supermarket_products by product name query=%s limit=%s offset=%s",
            query,
            limit,
            offset,
        )
        pattern = f"%{query}%"
        stmt = (
            select(SupermarketProduct)
            .options(
                joinedload(SupermarketProduct.product).joinedload(Product.category),
                joinedload(SupermarketProduct.supermarket),
            )
            .join(SupermarketProduct.product)
            .where(Product.name.ilike(pattern))
            .order_by(Product.name, SupermarketProduct.expiration_date)
            .limit(limit)
            .offset(offset)
        )
        result = list(self.session.scalars(stmt).all())
        logger.info(
            "Search query=%s returned %s supermarket_product row(s)",
            query,
            len(result),
        )
        return result
