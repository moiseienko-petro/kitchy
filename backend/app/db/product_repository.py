import uuid
from typing import Optional, List

from app.db.connection import get_connection
from app.models.product import Product


class ProductRepository:

    def get_conn(self):
        return get_connection()

    def get_by_name_category(
        self, name: str, category: Optional[str]
    ) -> Optional[Product]:

        conn = self.get_conn()
        row = conn.execute(
            """
                SELECT * FROM products
                WHERE name = ? AND category IS ?
                """,
            (name, category),
        ).fetchone()

        return Product(**dict(row)) if row else None

    def create(self, name: str, category: Optional[str]) -> Product:
        product_id = str(uuid.uuid4())
        conn = self.get_conn()
        conn.execute(
            """
                INSERT INTO products (id, name, category)
                VALUES (?, ?, ?)
                """,
            (product_id, name, category),
        )
        conn.commit()

        return Product(
            id=product_id,
            name=name,
            category=category,
        )

    def get_or_create(self, name: str, category: Optional[str]) -> Product:
        existing = self.get_by_name_category(name, category)
        if existing:
            return existing

        return self.create(name, category)

    def search_by_name(
        self,
        query: str,
        limit: int = 10,
    ) -> List[Product]:

        q = f"%{query.lower()}%"

        conn = self.get_conn()
        rows = conn.execute(
            """
                SELECT *
                FROM products
                WHERE LOWER(name) LIKE ?
                ORDER BY name ASC
                LIMIT ?
                """,
            (q, limit),
        ).fetchall()

        return [Product(**dict(r)) for r in rows]

    def list_categories(self) -> List[str]:

        conn = self.get_conn()
        rows = conn.execute(
            """
                SELECT DISTINCT category
                FROM products
                WHERE category IS NOT NULL
                ORDER BY category ASC
                """
        ).fetchall()

        return [r["category"] for r in rows]

    def list_by_category(
        self,
        category: str,
        limit: int = 50,
    ) -> List[Product]:

        conn = self.get_conn()
        rows = conn.execute(
            """
                SELECT *
                FROM products
                WHERE category = ?
                ORDER BY name ASC
                LIMIT ?
                """,
            (category, limit),
        ).fetchall()

        return [Product(**dict(r)) for r in rows]
