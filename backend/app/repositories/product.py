from uuid import UUID
import logging
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.product import Product


logger = logging.getLogger(__name__)


class ProductRepository:
    def __init__(self, session: Session):
        self.session = session

    def get_by_id(self, id: UUID) -> Product | None:
        logger.debug("Fetching product id=%s", id)
        stmt = select(Product).where(Product.id == id)
        result = self.session.scalars(stmt).first()
        if result:
            logger.info("Found product id=%s name=%s", id, result.name)
        else:
            logger.warning("Product id=%s not found", id)
        return result

    def get_by_name(self, name: str) -> Product | None:
        logger.debug("Fetching product by name=%s", name)
        stmt = select(Product).where(Product.name == name)
        result = self.session.scalars(stmt).first()
        if result:
            logger.info("Found product name=%s", name)
        else:
            logger.warning("Product name=%s not found", name)
        return result

    def get_all(self, limit: int, offset: int) -> list[Product]:
        logger.debug("Fetching all products limit=%s, offset=%s", limit, offset)
        stmt = select(Product).order_by(Product.name).limit(limit).offset(offset)
        result = list(self.session.scalars(stmt).all())
        logger.info("Retrieved %s product(s)", len(result))
        return result

    def create(self, product: Product) -> Product:
        logger.debug("Creating product name=%s", product.name)
        self.session.add(product)
        self.session.commit()
        self.session.refresh(product)
        logger.info("Product created id=%s name=%s", product.id, product.name)
        return product

    def update(self, product: Product) -> Product:
        logger.debug("Updating product id=%s", product.id)
        self.session.add(product)
        self.session.commit()
        self.session.refresh(product)
        logger.info("Product updated id=%s", product.id)
        return product

    def set_active(self, id: UUID) -> Product | None:
        logger.debug("Activating product id=%s", id)
        product = self.get_by_id(id)
        if not product:
            logger.warning("Product id=%s not found for activation", id)
            return None
        product.is_active = True
        self.session.commit()
        self.session.refresh(product)
        logger.info("Product activated id=%s", id)
        return product

    def set_inactive(self, id: UUID) -> Product | None:
        logger.debug("Deactivating product id=%s", id)
        product = self.get_by_id(id)
        if not product:
            logger.warning("Product id=%s not found for deactivation", id)
            return None
        product.is_active = False
        self.session.commit()
        self.session.refresh(product)
        logger.info("Product deactivated id=%s", id)
        return product
