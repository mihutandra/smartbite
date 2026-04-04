from uuid import UUID
from app.exceptions.exceptions import AlreadyExists, NotFound
from app.models.product import Product
from app.repositories.product import ProductRepository
from app.schemas.product import ProductCreate


class ProductService:
    def __init__(self, product_repo: ProductRepository):
        self.product_repo = product_repo

    def list_all(self, page: int, page_size: int) -> list[Product]:
        offset = (page - 1) * page_size
        return self.product_repo.get_all(limit=page_size, offset=offset)

    def get_by_id(self, product_id: UUID) -> Product:
        product = self.product_repo.get_by_id(product_id)
        if not product:
            raise NotFound(entity="Product", identifier=str(product_id))
        return product

    def create(self, product_data: ProductCreate) -> Product:
        existing = self.product_repo.get_by_name(product_data.name)
        if existing:
            raise AlreadyExists(entity="Product", identifier=product_data.name)

        product = Product(**product_data.model_dump())
        return self.product_repo.create(product)
