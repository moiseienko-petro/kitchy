import time
import uuid
from typing import List

from app.db.connection import get_connection
from app.models.shopping_item import ShoppingItem
from app.models.views.shopping_item_view import ShoppingItemView
from app.models.product import Product


class ShoppingItemRepository:

    def get_conn(self):
        return get_connection()

    # --------------------------------------------------
    # LIST (VIEW with JOIN)
    # --------------------------------------------------

    def list_view_by_list_id(self, list_id: str) -> List[ShoppingItemView]:
        conn = self.get_conn()

        rows = conn.execute(
            """
            SELECT
                si.id,
                si.list_id,
                si.product_id,
                si.created_at_ts,
                si.quantity,
                p.name,
                p.category_id,
                c.name AS category_name
            FROM shopping_items si
            JOIN products p ON p.id = si.product_id
            JOIN category c ON c.id = p.category_id
            WHERE si.list_id = ?
            ORDER BY si.created_at_ts ASC
            """,
            (list_id,),
        ).fetchall()

        return [ShoppingItemView(**dict(r)) for r in rows]

    # --------------------------------------------------
    # CREATE
    # --------------------------------------------------

    def add(
        self,
        list_id: str,
        product: Product,
        quantity: str = "1",
    ) -> ShoppingItem:

        item_id = str(uuid.uuid4())
        now = int(time.time())

        conn = self._get_conn()

        conn.execute(
            """
            INSERT INTO shopping_items
                (id, list_id, product_id, created_at_ts, quantity)
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                item_id,
                list_id,
                product.id,
                now,
                quantity,
            ),
        )
        conn.commit()

        return ShoppingItem(
            id=item_id,
            list_id=list_id,
            product_id=product.id,
            created_at_ts=now,
            quantity=quantity,
        )

    # --------------------------------------------------
    # CLEAR LIST
    # --------------------------------------------------

    def clear(self, list_id: str) -> None:
        conn = self._get_conn()

        conn.execute(
            "DELETE FROM shopping_items WHERE list_id = ?",
            (list_id,),
        )
        conn.commit()

    # --------------------------------------------------
    # UPDATE QUANTITY
    # --------------------------------------------------

    def update_quantity(self, item_id: str, quantity: str) -> None:
        conn = self._get_conn()
        conn.execute(
            """
            UPDATE shopping_items
            SET quantity = ?
            WHERE id = ?
            """,
            (quantity, item_id),
        )
        conn.commit()

    # --------------------------------------------------
    # DELETE
    # --------------------------------------------------

    def delete_item(self, item_id: str) -> None:
        conn = self._get_conn()
        conn.execute(
            "DELETE FROM shopping_items WHERE id = ?",
            (item_id,),
        )
        conn.commit()