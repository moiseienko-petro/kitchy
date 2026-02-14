from typing import List
from app.db.product_repository import ProductRepository
from app.models.product import Product


class ProductService:

    def __init__(self, repo: ProductRepository):
        self.repo = repo

    def autocomplete(self, query: str) -> List[Product]:
        clean = (query or "").strip()
        if not clean or len(clean) < 2:
            return []
        return self.repo.search_by_name(clean)

    def list_categories(self) -> List[str]:
        return self.repo.list_categories()

    def list_by_category(self, category: str) -> List[Product]:
        return self.repo.list_by_category(category)