import time
import uuid
from typing import List

from app.db.connection import get_connection
from app.models.shopping_item import ShoppingItem
from app.models.product import Product


class ShoppingItemRepository:

    def get_conn(self):
        return get_connection()

    def list_by_list_id(self, list_id: str) -> List[ShoppingItem]:
        conn = self.get_conn()

        rows = conn.execute(
            """
                SELECT *
                FROM shopping_items
                WHERE list_id = ?
                ORDER BY created_at_ts ASC
                """,
            (list_id,),
        ).fetchall()

        return [ShoppingItem(**dict(r)) for r in rows]

    def add(
        self,
        list_id: str,
        product: Product,
    ) -> ShoppingItem:

        item_id = str(uuid.uuid4())
        now = int(time.time())

        conn = self.get_conn()

        conn.execute(
            """
                INSERT INTO shopping_items
                  (id, list_id, product_id, name, category, created_at_ts)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
            (
                item_id,
                list_id,
                product.id,
                product.name,
                product.category,
                now,
            ),
        )
        conn.commit()

        return ShoppingItem(
            id=item_id,
            list_id=list_id,
            product_id=product.id,
            name=product.name,
            category=product.category,
            created_at_ts=now,
            quantity=1,
        )

    def clear(self, list_id: str) -> None:
        conn = self.get_conn()

        conn.execute(
            "DELETE FROM shopping_items WHERE list_id = ?",
            (list_id,),
        )
        conn.commit()

    def update_quantity(self, item_id: str, quantity: str) -> None:
        conn = self.get_conn()
        conn.execute(
            """
            UPDATE shopping_items
            SET quantity = ?
            WHERE id = ?
            """,
            (quantity, item_id),
        )

        conn.commit()

    def delete_item(self, item_id: str) -> None:
        conn = self.get_conn()
        conn.execute(
            "DELETE FROM shopping_items WHERE id = ?",
            (item_id,),
        )

        conn.commit()
