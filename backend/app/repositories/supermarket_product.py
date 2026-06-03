from uuid import UUID
import logging
from sqlalchemy import select, or_
from sqlalchemy.orm import Session, joinedload
from app.models.product import Product
from app.models.supermarket import Supermarket
from app.models.supermarket_products import SupermarketProduct
from sqlalchemy import func


logger = logging.getLogger(__name__)

SEARCH_DIACRITIC_MAP = [
    ("ă", "a"),
    ("â", "a"),
    ("î", "i"),
    ("ș", "s"),
    ("ş", "s"),
    ("ț", "t"),
    ("ţ", "t"),
]


def normalize_search_term(value: str) -> str:
    normalized = value.lower()
    for diacritic, replacement in SEARCH_DIACRITIC_MAP:
        normalized = normalized.replace(diacritic, replacement)
    return normalized


def normalize_search_expression(expr):
    result = func.lower(expr)
    for diacritic, replacement in SEARCH_DIACRITIC_MAP:
        result = func.replace(result, diacritic, replacement)
    return result


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
        pattern = f"%{normalize_search_term(query)}%"
        stmt = (
            select(SupermarketProduct)
            .options(
                joinedload(SupermarketProduct.product).joinedload(Product.category),
                joinedload(SupermarketProduct.supermarket),
            )
            .join(SupermarketProduct.product)
            .where(
                or_(
                    normalize_search_expression(Product.name).like(pattern),
                    normalize_search_expression(Product.description).like(pattern),
                    normalize_search_expression(Product.brand).like(pattern),
                )
            )
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


    def get_counts_by_supermarket(self) -> list[tuple]:
        logger.debug("Fetching product counts grouped by supermarket")

        stmt = (
            select(
                SupermarketProduct.supermarket_id,
                Supermarket.name,
                func.count().label("product_count"),
            )
            .join(Supermarket, SupermarketProduct.supermarket_id == Supermarket.id)
            .where(SupermarketProduct.is_available.is_(True))
            .group_by(SupermarketProduct.supermarket_id, Supermarket.name)
            .order_by(Supermarket.name)
        )
        rows = self.session.execute(stmt).all()
        logger.info("Retrieved product counts for %s supermarket(s)", len(rows))
        return rows

    def get_count_by_supermarket_and_category(self, supermarket_id: UUID, category_id: UUID) -> int:

        stmt = (
            select(func.count())
            .select_from(SupermarketProduct)
            .join(Product, SupermarketProduct.product_id == Product.id)
            .where(SupermarketProduct.supermarket_id == supermarket_id)
            .where(Product.category_id == category_id)
            .where(SupermarketProduct.is_available.is_(True))
        )
        return self.session.execute(stmt).scalar() or 0
