import mimetypes
from pathlib import Path
from urllib.parse import urlparse
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen
from uuid import UUID
from fastapi import HTTPException
from app.exceptions.exceptions import AlreadyExists, NotFound
from app.models.product import Product
from app.repositories.product import ProductRepository
from app.schemas.product import ProductCreate

BACKEND_DIR = Path(__file__).resolve().parents[2]
ROOT_DIR = BACKEND_DIR.parent
FRONTEND_PUBLIC_DIR = (
    (ROOT_DIR / "frontend" / "public")
    if (ROOT_DIR / "frontend" / "public").exists()
    else BACKEND_DIR / "frontend" / "public"
)


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

        local_path = self._resolve_local_image_path(product.image_url)
        if local_path is not None:
            content_type = mimetypes.guess_type(local_path.name)[0] or "image/jpeg"
            return local_path.read_bytes(), content_type

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

    def _resolve_local_image_path(self, image_url: str) -> Path | None:
        parsed_url = urlparse(image_url)
        if parsed_url.scheme in {"http", "https"}:
            return None

        image_path = image_url.strip()
        if image_path.startswith("frontend/public/"):
            root_candidate = ROOT_DIR / image_path
            candidate = root_candidate if root_candidate.exists() else BACKEND_DIR / image_path
        elif image_path.startswith("/products/"):
            candidate = FRONTEND_PUBLIC_DIR / image_path.lstrip("/")
        elif image_path.startswith("products/"):
            candidate = FRONTEND_PUBLIC_DIR / image_path
        else:
            return None

        public_dir = FRONTEND_PUBLIC_DIR.resolve()
        resolved_candidate = candidate.resolve()
        if not resolved_candidate.is_relative_to(public_dir) or not resolved_candidate.is_file():
            raise NotFound(entity="Product image", identifier=image_url)

        return resolved_candidate
