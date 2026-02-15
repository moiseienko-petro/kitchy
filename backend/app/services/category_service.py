from typing import List, Optional

from app.db.category_repository import CategoryRepository
from app.models.category import Category


class CategoryService:

    def __init__(self, repo: CategoryRepository):
        self.repo = repo

    # --------------------------------------------------
    # READ
    # --------------------------------------------------

    def list_all(self) -> List[Category]:
        return self.repo.list_all()

    def get_by_id(self, category_id: str) -> Optional[Category]:
        return self.repo.get_by_id(category_id)

    # --------------------------------------------------
    # CREATE
    # --------------------------------------------------

    def create(self, name: str) -> Category:
        clean = (name or "").strip()

        if not clean:
            raise ValueError("Category name cannot be empty")

        existing = self.repo.get_by_name(clean)
        if existing:
            return existing

        return self.repo.create(clean)

    # --------------------------------------------------
    # UPDATE
    # --------------------------------------------------

    def update(self, category_id: str, name: str) -> Optional[Category]:
        clean = (name or "").strip()

        if not clean:
            raise ValueError("Category name cannot be empty")

        updated = self.repo.update(category_id, clean)
        if not updated:
            return None

        return self.repo.get_by_id(category_id)

    # --------------------------------------------------
    # DELETE
    # --------------------------------------------------

    def delete(self, category_id: str) -> bool:
        return self.repo.delete(category_id)