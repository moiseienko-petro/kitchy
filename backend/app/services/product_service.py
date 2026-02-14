from typing import List, Optional

from app.db.product_repository import ProductRepository
from app.models.product import Product


class ProductService:

    def __init__(self, repo: ProductRepository):
        self.repo = repo

    # -------------------------
    # AUTOCOMPLETE
    # -------------------------

    def autocomplete(self, query: str) -> List[Product]:
        clean = (query or "").strip()
        if not clean or len(clean) < 2:
            return []
        return self.repo.search_by_name(clean)

    # -------------------------
    # READ
    # -------------------------

    def get_by_id(self, product_id: str) -> Optional[Product]:
        return self.repo.get_by_id(product_id)

    def list_all(self, limit: int = 100) -> List[Product]:
        return self.repo.list_all(limit)

    def list_categories(self) -> List[str]:
        return self.repo.list_categories()

    def list_by_category(self, category: str) -> List[Product]:
        clean = (category or "").strip()
        if not clean:
            return []
        return self.repo.list_by_category(clean)

    # -------------------------
    # CREATE
    # -------------------------

    def create(self, name: str, category: Optional[str]) -> Product:
        clean_name = (name or "").strip()
        clean_category = (category or "").strip() or None

        if not clean_name:
            raise ValueError("Product name cannot be empty")

        return self.repo.create(clean_name, clean_category)

    def get_or_create(self, name: str, category: Optional[str]) -> Product:
        clean_name = (name or "").strip()
        clean_category = (category or "").strip() or None

        if not clean_name:
            raise ValueError("Product name cannot be empty")

        return self.repo.get_or_create(clean_name, clean_category)

    # -------------------------
    # UPDATE
    # -------------------------

    def update(
        self,
        product_id: str,
        name: Optional[str] = None,
        category: Optional[str] = None,
    ) -> Optional[Product]:

        clean_name = name.strip() if name is not None else None
        clean_category = (
            category.strip() if category is not None else None
        )

        if clean_name is not None and not clean_name:
            raise ValueError("Product name cannot be empty")

        return self.repo.update(
            product_id=product_id,
            name=clean_name,
            category=clean_category,
        )

    # -------------------------
    # DELETE
    # -------------------------

    def delete(self, product_id: str) -> bool:
        return self.repo.delete(product_id)