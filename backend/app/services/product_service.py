from typing import List, Optional

from app.db.product_repository import ProductRepository
from app.db.category_repository import CategoryRepository
from app.models.product import Product
from app.models.views.product_view import ProductView


class ProductService:

    def __init__(
        self,
        product_repo: ProductRepository,
        category_repo: CategoryRepository,
    ):
        self.product_repo = product_repo
        self.category_repo = category_repo

    # --------------------------------------------------
    # AUTOCOMPLETE (returns VIEW)
    # --------------------------------------------------

    def autocomplete(self, query: str) -> List[ProductView]:
        clean = (query or "").strip()
        if not clean or len(clean) < 2:
            return []
        return self.product_repo.search_views_by_name(clean)

    # --------------------------------------------------
    # READ
    # --------------------------------------------------

    def get_by_id(self, product_id: str) -> Optional[Product]:
        return self.product_repo.get_by_id(product_id)

    def get_view_by_id(self, product_id: str) -> Optional[ProductView]:
        return self.product_repo.get_view_by_id(product_id)

    def list_all(self, limit: int = 200) -> List[ProductView]:
        return self.product_repo.list_all_views(limit)

    # --------------------------------------------------
    # CREATE
    # --------------------------------------------------

    def create(
        self,
        name: str,
        category_name: Optional[str],
    ) -> Product:

        clean_name = (name or "").strip()
        clean_category = (category_name or "").strip()

        if not clean_name:
            raise ValueError("Product name cannot be empty")

        # ensure category
        if clean_category:
            category = self.category_repo.get_by_name(clean_category)
            if not category:
                category = self.category_repo.create(clean_category)
        else:
            # fallback to default category
            self.category_repo.ensure_default_exists()
            category = self.category_repo.get_by_name("Other")

        return self.product_repo.create(
            name=clean_name,
            category_id=category.id,
        )

    def get_or_create(
        self,
        name: str,
        category_name: Optional[str],
    ) -> Product:

        clean_name = (name or "").strip()
        clean_category = (category_name or "").strip()

        if not clean_name:
            raise ValueError("Product name cannot be empty")

        # ensure category
        if clean_category:
            category = self.category_repo.get_by_name(clean_category)
            if not category:
                category = self.category_repo.create(clean_category)
        else:
            self.category_repo.ensure_default_exists()
            category = self.category_repo.get_by_name("Other")

        return self.product_repo.get_or_create(
            name=clean_name,
            category_id=category.id,
        )

    # --------------------------------------------------
    # UPDATE
    # --------------------------------------------------

    def update(
        self,
        product_id: str,
        name: Optional[str] = None,
        category_name: Optional[str] = None,
    ) -> Optional[Product]:

        clean_name = name.strip() if name is not None else None
        clean_category = (
            category_name.strip() if category_name is not None else None
        )

        if clean_name is not None and not clean_name:
            raise ValueError("Product name cannot be empty")

        category_id = None

        if clean_category is not None:
            if clean_category:
                category = self.category_repo.get_by_name(clean_category)
                if not category:
                    category = self.category_repo.create(clean_category)
                category_id = category.id
            else:
                # empty string → fallback default
                self.category_repo.ensure_default_exists()
                default_cat = self.category_repo.get_by_name("Other")
                category_id = default_cat.id

        return self.product_repo.update(
            product_id=product_id,
            name=clean_name,
            category_id=category_id,
        )

    # --------------------------------------------------
    # DELETE
    # --------------------------------------------------

    def delete(self, product_id: str) -> bool:
        return self.product_repo.delete(product_id)