from uuid import UUID
from app.exceptions.exceptions import NotFound
from app.models.supermarket import Supermarket
from app.repositories.supermarket import SupermarketRepository


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