from typing import List, Optional

from app.db.product_repository import ProductRepository
from app.db.shopping_list_repository import ShoppingListRepository
from app.db.shopping_item_repository import ShoppingItemRepository
from app.models.shopping_list import ShoppingList
from app.models.views.shopping_item_view import ShoppingItemView


class ShoppingService:

    def __init__(
        self,
        product_repo: ProductRepository,
        list_repo: ShoppingListRepository,
        item_repo: ShoppingItemRepository,
    ):
        self.product_repo = product_repo
        self.list_repo = list_repo
        self.item_repo = item_repo

    def _ensure_active_list(self) -> ShoppingList:
        active = self.list_repo.get_active()
        if active:
            return active
        return self.list_repo.create_active()

    # ---------- public API ----------

    def get_current_list(self) -> ShoppingList:
        return self._ensure_active_list()

    def list_items(self) -> List[ShoppingItemView]:
        active = self._ensure_active_list()
        return self.item_repo.list_view_by_list_id(active.id)

    def add_item(
        self,
        name: str,
        category: Optional[str]
    ) -> ShoppingItemView:

        clean = (name or "").strip()
        if not clean:
            raise ValueError("name is required")

        active = self._ensure_active_list()

        product = self.product_repo.get_or_create(clean, category)

        self.item_repo.add(
            list_id=active.id,
            product=product
        )

        # повертаємо одразу view через JOIN
        return self.item_repo.list_view_by_list_id(active.id)[-1]

    def done(self) -> ShoppingList:
        self.list_repo.archive_active()
        return self.list_repo.create_active()

    def update_quantity(self, item_id: str, quantity: str) -> None:
        if not quantity or not quantity.strip():
            raise ValueError("quantity cannot be empty")
        self.item_repo.update_quantity(item_id, quantity.strip())

    def delete_item(self, item_id: str) -> None:
        self.item_repo.delete_item(item_id)
