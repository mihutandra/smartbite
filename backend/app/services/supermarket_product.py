from uuid import UUID
from app.exceptions.exceptions import NotFound, ValidationError
from app.models.supermarket_products import SupermarketProduct
from app.repositories.supermarket_product import SupermarketProductRepository


class SupermarketProductService:
    def __init__(self, supermarket_product_repo: SupermarketProductRepository):
        self.supermarket_product_repo = supermarket_product_repo

    def list_all(self, page: int, page_size: int) -> list[SupermarketProduct]:
        offset = (page - 1) * page_size
        return self.supermarket_product_repo.get_all(limit=page_size, offset=offset)

    def get_by_id(self, supermarket_product_id: UUID) -> SupermarketProduct:
        supermarket_product = self.supermarket_product_repo.get_by_id(supermarket_product_id)
        if not supermarket_product:
            raise NotFound(entity="SupermarketProduct", identifier=str(supermarket_product_id))
        return supermarket_product

    def search_by_product_name(
        self,
        query: str,
        page: int,
        page_size: int,
    ) -> list[SupermarketProduct]:
        cleaned_query = query.strip()
        if not cleaned_query:
            raise ValidationError(message="Search query cannot be empty", field="q")

        offset = (page - 1) * page_size
        return self.supermarket_product_repo.search_by_product_name(
            query=cleaned_query,
            limit=page_size,
            offset=offset,
        )
