from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen
from uuid import UUID
from fastapi import HTTPException
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

    def fetch_product_image(self, product_id: UUID) -> tuple[bytes, str]:
        product = self.get_by_id(product_id=product_id)
        if not product.image_url:
            raise NotFound(entity="Product image", identifier=str(product_id))

        request = Request(
            product.image_url,
            headers={
                "User-Agent": "SmartBite/1.0",
                "Accept": "image/*,*/*;q=0.8",
            },
        )

        try:
            with urlopen(request, timeout=10) as response:
                content = response.read()
                content_type = response.headers.get_content_type() or "image/jpeg"
                return content, content_type
        except HTTPError as exc:
            raise HTTPException(
                status_code=502,
                detail=f"Failed to fetch upstream image (status={exc.code})",
            ) from exc
        except URLError as exc:
            raise HTTPException(
                status_code=502,
                detail="Failed to fetch upstream image",
            ) from exc
