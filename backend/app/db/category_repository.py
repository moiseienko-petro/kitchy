import uuid
from typing import List, Optional

from app.db.connection import get_connection
from app.models.category import Category


DEFAULT_CATEGORY_ID = "00000000-0000-0000-0000-000000000000"
DEFAULT_CATEGORY_NAME = "Other"


class CategoryRepository:

    def get_conn(self):
        return get_connection()

    # --------------------------------------------------
    # CREATE
    # --------------------------------------------------

    def create(self, name: str) -> Category:
        category_id = str(uuid.uuid4())

        conn = self.get_conn()
        conn.execute(
            """
            INSERT INTO category (id, name)
            VALUES (?, ?)
            """,
            (category_id, name),
        )
        conn.commit()

        return Category(id=category_id, name=name)

    # --------------------------------------------------
    # READ
    # --------------------------------------------------

    def get_by_id(self, category_id: str) -> Optional[Category]:
        conn = self.get_conn()
        row = conn.execute(
            """
            SELECT * FROM category WHERE id = ?
            """,
            (category_id,),
        ).fetchone()

        return Category(**dict(row)) if row else None

    def get_by_name(self, name: str) -> Optional[Category]:
        conn = self.get_conn()
        row = conn.execute(
            """
            SELECT * FROM category
            WHERE LOWER(name) = LOWER(?)
            """,
            (name,),
        ).fetchone()

        return Category(**dict(row)) if row else None

    def list_all(self) -> List[Category]:
        conn = self.get_conn()
        rows = conn.execute(
            """
            SELECT * FROM category
            ORDER BY name ASC
            """
        ).fetchall()

        return [Category(**dict(r)) for r in rows]

    # --------------------------------------------------
    # UPDATE
    # --------------------------------------------------

    def update(self, category_id: str, new_name: str) -> bool:
        if category_id == DEFAULT_CATEGORY_ID:
            return False  # protect default category

        conn = self.get_conn()
        cur = conn.execute(
            """
            UPDATE category
            SET name = ?
            WHERE id = ?
            """,
            (new_name, category_id),
        )
        conn.commit()

        return cur.rowcount > 0

    # --------------------------------------------------
    # DELETE
    # --------------------------------------------------

    def delete(self, category_id: str) -> bool:
        if category_id == DEFAULT_CATEGORY_ID:
            return False  # protect default category

        conn = self.get_conn()
        cur = conn.execute(
            """
            DELETE FROM category
            WHERE id = ?
            """,
            (category_id,),
        )
        conn.commit()

        return cur.rowcount > 0