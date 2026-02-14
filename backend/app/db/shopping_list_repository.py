import time
import uuid
from typing import Optional

from app.db.connection import get_connection
from app.models.shopping_list import ShoppingList


class ShoppingListRepository:

    def get_conn(self):
        return get_connection()

    def get_active(self) -> Optional[ShoppingList]:
        conn = get_connection()
        row = conn.execute(
                "SELECT * FROM shopping_lists WHERE status = 'active'"
            ).fetchone()

        return ShoppingList(**dict(row)) if row else None

    def create_active(self) -> ShoppingList:
        list_id = str(uuid.uuid4())
        now = int(time.time())
        conn = get_connection()
        
        conn.execute(
                """
                INSERT INTO shopping_lists (id, status, created_at_ts)
                VALUES (?, 'active', ?)
                """,
                (list_id, now),
            )
        conn.commit()

        return ShoppingList(
            id=list_id,
            status="active",
            created_at_ts=now,
            external_ref=None,
        )

    def archive_active(self) -> None:

        conn = get_connection()

        conn.execute(
                "UPDATE shopping_lists SET status = 'archived' WHERE status = 'active'"
            )
        conn.commit()